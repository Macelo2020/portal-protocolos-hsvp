// Professor de Programação: Backend v13.0 (Versão Dourada - Com Edição de Categoria)
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const multer = require('multer'); 
const path = require('path'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');    
const fs = require('fs'); 

const app = express();
const PORT = 3001;
const JWT_SECRET = "minha-chave-secreta-super-dificil-123"; 

// --- CONFIGURAÇÃO ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));
app.use(express.json()); 

// Configuração do Banco de Dados
const pool = mysql.createPool({
  host: 'localhost', user: 'root', password: '', database: 'portal_protocolos',
  port: 3306, waitForConnections: true, connectionLimit: 10, queueLimit: 0,
  enableKeepAlive: true, keepAliveInitialDelay: 0, charset: 'utf8mb4' 
});
const connection = pool; 

// --- PASTAS E UPLOAD ---
const dirImages = path.join(__dirname, 'public/images');
const dirPdfs = path.join(__dirname, 'public/pdfs');
if (!fs.existsSync(dirImages)) fs.mkdirSync(dirImages, { recursive: true });
if (!fs.existsSync(dirPdfs)) fs.mkdirSync(dirPdfs, { recursive: true });

// Serve arquivos estáticos (Imagens e PDFs)
app.use('/images', express.static(dirImages));
app.use('/pdfs', express.static(dirPdfs));

// Configuração do Multer (Upload de arquivos)
const superStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'public/pdfs/';
    if (['imagem_capa', 'imagem'].includes(file.fieldname)) folder = 'public/images/';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    try {
        const nomeLimpo = file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.]/g, '_'); 
        cb(null, `${Date.now()}_${nomeLimpo}`);
    } catch (e) { cb(null, Date.now() + "_arquivo_seguro.pdf"); }
  }
});
const upload = multer({ storage: superStorage, limits: { fileSize: 50 * 1024 * 1024 } });

// --- MIDDLEWARES DE SEGURANÇA ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (token == null) return res.status(401).json({ error: 'Token necessário' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user; next();
  });
};

const checkRole = (role) => (req, res, next) => {
    if (!req.user || req.user.funcao !== role) return res.status(403).json({ error: 'Acesso negado' });
    next();
};

// --- ROTAS DA API ---

// 1. Listagens Públicas
app.get('/api/categorias', (req, res) => {
  connection.query(`SELECT categorias.*, COUNT(protocolos.id) AS quantidade_protocolos FROM categorias LEFT JOIN protocolos ON categorias.id = protocolos.categoria_id GROUP BY categorias.id ORDER BY categorias.nome ASC`, (err, r) => res.json(r));
});

app.get('/api/protocolos', (req, res) => {
  connection.query(`SELECT p.*, c.nome as nome_categoria FROM protocolos p LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY p.titulo ASC`, (err, r) => res.json(r));
});

// 2. Gestão de Protocolos
app.post('/api/protocolos/massa', upload.array('arquivos_pdf', 5), (req, res) => {
    const { categoria_id } = req.body;
    let processados = 0;
    req.files.forEach((file) => {
        const titulo = file.originalname.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        connection.query("INSERT INTO protocolos (titulo, categoria_id, nome_arquivo_pdf, caminho_imagem_capa) VALUES (?, ?, ?, '')", [titulo, categoria_id, file.filename], () => {
            processados++;
            if (processados === req.files.length) res.status(200).json({ message: `Concluído.` });
        });
    });
});

app.post('/api/protocolos', authenticateToken, upload.fields([{ name: 'arquivo_pdf', maxCount: 1 }, { name: 'imagem_capa', maxCount: 1 }]), (req, res) => {
    const { titulo, categoria_id } = req.body;
    const pdf = req.files['arquivo_pdf'] ? req.files['arquivo_pdf'][0] : null;
    const capa = req.files['imagem_capa'] ? req.files['imagem_capa'][0] : null;
    if (!pdf) return res.status(400).json({ error: 'PDF obrigatório' });
    
    connection.query("INSERT INTO protocolos (titulo, categoria_id, nome_arquivo_pdf, caminho_imagem_capa) VALUES (?, ?, ?, ?)", 
    [titulo, categoria_id, pdf.filename, capa ? capa.filename : ''], (err, r) => {
        if (err) return res.status(500).json({error: err.message});
        res.status(201).json({ id: r.insertId });
    });
});

app.put('/api/protocolos/:id', authenticateToken, upload.fields([{ name: 'arquivo_pdf', maxCount: 1 }, { name: 'imagem_capa', maxCount: 1 }]), (req, res) => {
    const id = req.params.id;
    const { titulo, categoria_id } = req.body;
    const novoPdf = req.files['arquivo_pdf'] ? req.files['arquivo_pdf'][0] : null;
    const novaCapa = req.files['imagem_capa'] ? req.files['imagem_capa'][0] : null;

    let sql = "UPDATE protocolos SET titulo = ?, categoria_id = ?";
    const params = [titulo, categoria_id];

    if (novoPdf) { sql += ", nome_arquivo_pdf = ?"; params.push(novoPdf.filename); }
    if (novaCapa) { sql += ", caminho_imagem_capa = ?"; params.push(novaCapa.filename); }

    sql += " WHERE id = ?";
    params.push(id);

    connection.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar: " + err.message });
        res.json({ message: "Protocolo atualizado com sucesso!" });
    });
});

app.delete('/api/protocolos/:id', authenticateToken, (req, res) => {
  connection.query("DELETE FROM favoritos WHERE protocolo_id = ?", [req.params.id], () => {
      connection.query("DELETE FROM protocolos WHERE id = ?", [req.params.id], (err) => {
          if (err) return res.status(500).send(err);
          res.json({ message: "Deletado" });
      });
  });
});

// 3. Gestão de Categorias (CRIAR, EDITAR, DELETAR)
app.post('/api/categorias', authenticateToken, checkRole('admin_master'), upload.single('imagem'), (req, res) => {
  connection.query("INSERT INTO categorias (nome, nome_imagem_capa) VALUES (?, ?)", [req.body.nome, req.file ? req.file.filename : null], (err, r) => res.status(201).json({ id: r.insertId }));
});

// ✅ ROTA QUE FALTAVA: Editar Categoria (PUT)
app.put('/api/categorias/:id', authenticateToken, checkRole('admin_master'), upload.single('imagem'), (req, res) => {
    const id = req.params.id;
    const { nome } = req.body;
    
    let sql = "UPDATE categorias SET nome = ?";
    let params = [nome];

    if (req.file) {
        sql += ", nome_imagem_capa = ?";
        params.push(req.file.filename);
    }

    sql += " WHERE id = ?";
    params.push(id);

    connection.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Categoria atualizada com sucesso!" });
    });
});

app.delete('/api/categorias/:id', authenticateToken, checkRole('admin_master'), (req, res) => {
    connection.query("DELETE FROM categorias WHERE id = ?", [req.params.id], () => res.json({message:'ok'}));
});

// 4. Favoritos e Login
app.post('/api/favoritos', authenticateToken, (req, res) => {
    connection.query("INSERT INTO favoritos (usuario_id, protocolo_id) VALUES (?, ?)", [req.user.id, req.body.protocolo_id], (err,r) => res.status(201).json({id:r.insertId}));
});
app.get('/api/favoritos/meus', authenticateToken, (req, res) => {
    connection.query(`SELECT p.*, f.id AS favorito_id FROM protocolos p JOIN favoritos f ON p.id = f.protocolo_id WHERE f.usuario_id = ? ORDER BY p.titulo ASC`, [req.user.id], (err, r) => res.json(r));
});
app.delete('/api/favoritos/:protocolo_id', authenticateToken, (req, res) => {
    connection.query("DELETE FROM favoritos WHERE usuario_id = ? AND protocolo_id = ?", [req.user.id, req.params.protocolo_id], () => res.json({message:'ok'}));
});
app.post('/api/login', (req, res) => {
  connection.query("SELECT * FROM usuarios WHERE username = ?", [req.body.username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Inválido' });
    if (!await bcrypt.compare(req.body.password, results[0].password_hash)) return res.status(401).json({ error: 'Inválido' });
    const token = jwt.sign({ id: results[0].id, username: results[0].username, funcao: results[0].funcao }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ message: 'Login ok', token });
  });
});

// ==================================================================
// --- 5. SERVIR O FRONTEND REACT (UNIFICAÇÃO) ---
// ==================================================================

// 1. Garante que o Express sirva os arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 2. Rota "Coringa" com REGEX (Correção do Express 5)
// Se não for API e não for arquivo com extensão, manda o index.html
app.get(/.*/, (req, res) => {
    if (req.url.includes('.')) {
        return res.status(404).send('Arquivo não encontrado');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================================================================
// --- INICIALIZAÇÃO DO SERVIDOR ---
// ==================================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===========================================================`);
  console.log(`🚀 SERVIDOR UNIFICADO (BACKEND + FRONTEND) RODANDO!`);
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌐 Acesso Local: http://localhost:${PORT}`);
  console.log(`🌐 Acesso Rede:  http://192.168.0.201:${PORT}`);
  console.log(`===========================================================`);
});