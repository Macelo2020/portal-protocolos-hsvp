// ==================================================================
// PROJETO: Portal de Protocolos HSVP (Backend v14.2 - Automação Total de Capas)
// ARQUITETURA: Servidor Unificado Node.js + Express + MySQL + Multer
// ==================================================================

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

// --- 1. CONFIGURAÇÕES E MIDDLEWARES GERAIS ---
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json()); 

// --- 2. CONEXÃO COM O BANCO DE DADOS ---
const pool = mysql.createPool({
  host: 'localhost', user: 'root', password: '', database: 'portal_protocolos', port: 3306, 
  waitForConnections: true, connectionLimit: 10, queueLimit: 0, enableKeepAlive: true, keepAliveInitialDelay: 0, charset: 'utf8mb4' 
});
const connection = pool; 

// --- 3. INFRAESTRUTURA DE PASTAS (AUTO-HEALING) ---
const dirImages = path.join(__dirname, 'public', 'images');
const dirPdfs = path.join(__dirname, 'public', 'pdfs');
if (!fs.existsSync(dirImages)) { fs.mkdirSync(dirImages, { recursive: true }); }
if (!fs.existsSync(dirPdfs)) { fs.mkdirSync(dirPdfs, { recursive: true }); }

app.use('/images', express.static(dirImages));
app.use('/pdfs', express.static(dirPdfs));

// --- 4. CONFIGURAÇÃO DE UPLOAD RESILIENTE ---
const superStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let targetFolder = dirPdfs;
    if (['imagem_capa', 'imagem'].includes(file.fieldname)) targetFolder = dirImages;
    cb(null, targetFolder);
  },
  filename: (req, file, cb) => {
    try {
        const nomeLimpo = file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.]/g, '_'); 
        cb(null, `${Date.now()}_${nomeLimpo}`);
    } catch (e) { cb(null, `${Date.now()}_arquivo_seguro.bin`); }
  }
});
const upload = multer({ storage: superStorage, limits: { fileSize: 50 * 1024 * 1024 } });

// --- 5. MIDDLEWARES DE AUTENTICAÇÃO ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (token == null) return res.status(401).json({ error: 'Token necessário.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sessão inválida.' });
    req.user = user; next();
  });
};

const checkRole = (role) => (req, res, next) => {
    if (!req.user || req.user.funcao !== role) return res.status(403).json({ error: 'Acesso negado.' });
    next();
};

// ==================================================================
// --- 6. ROTAS DA API ---
// ==================================================================

// Rotas de Configuração de Sistema (EXCLUSIVAS DO ADMIN MASTER)
app.post('/api/configuracoes/capa-padrao-categoria', authenticateToken, checkRole('admin_master'), upload.single('nova_imagem'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
  const caminhoDesejado = path.join(dirImages, 'default_categoria.png');
  try { fs.renameSync(req.file.path, caminhoDesejado); res.json({ success: true, message: 'Capa atualizada!' }); } catch (err) {}
});

app.post('/api/configuracoes/capa-padrao-protocolo', authenticateToken, checkRole('admin_master'), upload.single('nova_imagem'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
  const caminhoDesejado = path.join(dirImages, 'default_protocolo.png');
  try { fs.renameSync(req.file.path, caminhoDesejado); res.json({ success: true, message: 'Capa atualizada!' }); } catch (err) {}
});

// --- CATEGORIAS (Acesso Colaborativo com Capa Padrão Automática) ---
app.get('/api/categorias', (req, res) => {
  const query = `SELECT categorias.*, COUNT(protocolos.id) AS quantidade_protocolos FROM categorias LEFT JOIN protocolos ON categorias.id = protocolos.categoria_id GROUP BY categorias.id ORDER BY categorias.nome ASC`;
  connection.query(query, (err, results) => { res.json(results); });
});

app.post('/api/categorias', authenticateToken, upload.single('imagem'), (req, res) => {
    const { nome } = req.body;
    // INOVAÇÃO UX/UI: Se não vier capa (enfermagem), usa a default_categoria.png
    const nomeImagem = req.file ? req.file.filename : 'default_categoria.png';
    if (!nome) return res.status(400).json({ error: 'Nome obrigatório.' });
    connection.query("INSERT INTO categorias (nome, nome_imagem_capa) VALUES (?, ?)", [nome, nomeImagem], (err, r) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor.' });
        res.status(201).json({ id: r.insertId, nome, nome_imagem_capa: nomeImagem });
    });
});

app.put('/api/categorias/:id', authenticateToken, upload.single('imagem'), (req, res) => {
    const { nome } = req.body;
    connection.query("SELECT nome_imagem_capa FROM categorias WHERE id = ?", [req.params.id], (err, r) => {
        const imagemAntiga = r.length > 0 ? r[0].nome_imagem_capa : null;
        let sql = "UPDATE categorias SET nome = ?"; let params = [nome];
        if (req.file) { sql += ", nome_imagem_capa = ?"; params.push(req.file.filename); }
        sql += " WHERE id = ?"; params.push(req.params.id);
        connection.query(sql, params, () => {
            if (req.file && imagemAntiga && imagemAntiga !== 'default_categoria.png') fs.unlink(path.join(dirImages, imagemAntiga), () => {});
            res.json({ message: "Atualizada!" });
        });
    });
});

app.delete('/api/categorias/:id', authenticateToken, (req, res) => {
    const forcar = req.query.forcar === 'true';
    connection.query("SELECT id, nome_arquivo_pdf FROM protocolos WHERE categoria_id = ?", [req.params.id], (err, lista) => {
        if (lista.length > 0 && !forcar) return res.status(400).json({ possuiProtocolos: true, totalProtocolos: lista.length, error: `Possui ${lista.length} protocolo(s).` });
        if (lista.length > 0 && forcar) {
            const ids = lista.map(p => p.id);
            connection.query(`DELETE FROM favoritos WHERE protocolo_id IN (${ids.map(()=>'?').join(',')})`, ids, () => {
                connection.query("DELETE FROM protocolos WHERE categoria_id = ?", [req.params.id], () => {
                    lista.forEach(p => p.nome_arquivo_pdf && fs.unlink(path.join(dirPdfs, p.nome_arquivo_pdf), ()=>{}));
                    connection.query("DELETE FROM categorias WHERE id = ?", [req.params.id], () => res.json({ message: "Excluída." }));
                });
            });
        } else {
            connection.query("DELETE FROM categorias WHERE id = ?", [req.params.id], () => res.json({ message: "Excluída." }));
        }
    });
});

// --- PROTOCOLOS (Acesso Colaborativo com Capa Padrão Automática) ---
app.get('/api/protocolos', (req, res) => {
  connection.query(`SELECT p.*, c.nome as nome_categoria FROM protocolos p LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY p.titulo ASC`, (err, results) => { res.json(results); });
});

app.post('/api/protocolos/massa', authenticateToken, upload.array('arquivos_pdf', 5), (req, res) => {
    let processados = 0;
    req.files.forEach((file) => {
        const titulo = file.originalname.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        // INOVAÇÃO UX/UI: Envio em massa recebe automaticamente a capa padrão ('default_protocolo.png') em vez de vazio ('')
        connection.query("INSERT INTO protocolos (titulo, categoria_id, nome_arquivo_pdf, caminho_imagem_capa) VALUES (?, ?, ?, 'default_protocolo.png')", [titulo, req.body.categoria_id, file.filename], () => {
            processados++; if (processados === req.files.length) res.status(200).json({ message: 'Concluído.' });
        });
    });
});

// POST: Criar novo Protocolo (Com Automação de Capa Padrão)
app.post('/api/protocolos', authenticateToken, upload.fields([{ name: 'arquivo_pdf', maxCount: 1 }, { name: 'imagem_capa', maxCount: 1 }]), (req, res) => {
    const { titulo, categoria_id } = req.body;
    const pdf = req.files['arquivo_pdf'] ? req.files['arquivo_pdf'][0] : null;
    const capa = req.files['imagem_capa'] ? req.files['imagem_capa'][0] : null;
    
    if (!pdf) return res.status(400).json({ error: 'O documento PDF é obrigatório.' });
    
    // INOVAÇÃO UX/UI: Se nenhuma capa foi enviada (ex: Enfermagem), define a capa padrão!
    const nomeCapaFinal = capa ? capa.filename : 'default_protocolo.png';
    
    connection.query(
        "INSERT INTO protocolos (titulo, categoria_id, nome_arquivo_pdf, caminho_imagem_capa) VALUES (?, ?, ?, ?)", 
        [titulo, categoria_id, pdf.filename, nomeCapaFinal], 
        (err, r) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: r.insertId });
        }
    );
});

// PUT: Editar Protocolo Existente
app.put('/api/protocolos/:id', authenticateToken, upload.fields([{ name: 'arquivo_pdf', maxCount: 1 }, { name: 'imagem_capa', maxCount: 1 }]), (req, res) => {
    const id = req.params.id;
    const { titulo, categoria_id } = req.body;
    const novoPdf = req.files['arquivo_pdf'] ? req.files['arquivo_pdf'][0] : null;
    const novaCapa = req.files['imagem_capa'] ? req.files['imagem_capa'][0] : null;

    let sql = "UPDATE protocolos SET titulo = ?, categoria_id = ?";
    const params = [titulo, categoria_id];

    if (novoPdf) { sql += ", nome_arquivo_pdf = ?"; params.push(novoPdf.filename); }
    // Apenas atualiza a imagem se uma nova for enviada. Caso contrário, mantém a existente (padrão ou não)
    if (novaCapa) { sql += ", caminho_imagem_capa = ?"; params.push(novaCapa.filename); }

    sql += " WHERE id = ?";
    params.push(id);

    connection.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar protocolo: " + err.message });
        res.json({ message: "Protocolo atualizado com sucesso!" });
    });
});

app.delete('/api/protocolos/:id', authenticateToken, (req, res) => {
  connection.query("DELETE FROM favoritos WHERE protocolo_id = ?", [req.params.id], () => {
      connection.query("DELETE FROM protocolos WHERE id = ?", [req.params.id], () => { res.json({ message: "Excluído." }); });
  });
});

// --- FAVORITOS E LOGIN ---
app.post('/api/favoritos', authenticateToken, (req, res) => {
    connection.query("INSERT INTO favoritos (usuario_id, protocolo_id) VALUES (?, ?)", [req.user.id, req.body.protocolo_id], (err, r) => res.status(201).json({ id: r.insertId }));
});
app.get('/api/favoritos/meus', authenticateToken, (req, res) => {
    connection.query(`SELECT p.*, f.id AS favorito_id FROM protocolos p JOIN favoritos f ON p.id = f.protocolo_id WHERE f.usuario_id = ? ORDER BY p.titulo ASC`, [req.user.id], (err, r) => res.json(r));
});
app.delete('/api/favoritos/:protocolo_id', authenticateToken, (req, res) => {
    connection.query("DELETE FROM favoritos WHERE usuario_id = ? AND protocolo_id = ?", [req.user.id, req.params.protocolo_id], () => res.json({ message: 'Removido.' }));
});
app.post('/api/login', (req, res) => {
  connection.query("SELECT * FROM usuarios WHERE username = ?", [req.body.username], async (err, results) => {
    if (err || results.length === 0 || !await bcrypt.compare(req.body.password, results[0].password_hash)) return res.status(401).json({ error: 'Credenciais inválidas.' });
    const token = jwt.sign({ id: results[0].id, username: results[0].username, funcao: results[0].funcao }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ message: 'Sucesso.', token });
  });
});

// --- SERVIR FRONTEND E INICIAR SERVIDOR ---
app.use(express.static(path.join(__dirname, 'public')));
app.get(/.*/, (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
app.listen(PORT, '0.0.0.0', () => { console.log(`🚀 SERVIDOR RODANDO v14.2 - Porta: ${PORT}`); });