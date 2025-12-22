// Professor de Programação: Backend FINAL (v10.0 - Deleção Inteligente + Correções Anteriores)
// Portal de Protocolos - HSVP

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

// --- 1. CONFIGURAÇÃO DE SEGURANÇA (CORS) ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use(express.json()); 

// --- 2. BANCO DE DADOS ---
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'portal_protocolos',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4' 
});
const connection = pool; 

pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ ERRO CRÍTICO NO BANCO:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados MySQL com sucesso! (UTF-8 Ativo)');
    conn.release(); 
  }
});

// --- 3. PASTAS ESTÁTICAS ---
const dirImages = path.join(__dirname, 'public/images');
const dirPdfs = path.join(__dirname, 'public/pdfs');

if (!fs.existsSync(dirImages)) fs.mkdirSync(dirImages, { recursive: true });
if (!fs.existsSync(dirPdfs)) fs.mkdirSync(dirPdfs, { recursive: true });

app.use('/images', express.static(dirImages));
app.use('/pdfs', express.static(dirPdfs));
app.use(express.static(path.join(__dirname, 'public'))); 

// --- 4. UPLOAD (MULTER - 50MB) ---
const superStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'public/pdfs/';
    if (['imagem_capa', 'imagem'].includes(file.fieldname)) {
      folder = 'public/images/';
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    try {
        const nomeLimpo = file.originalname
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^a-zA-Z0-9.]/g, '_'); 
        const uniqueSuffix = Date.now(); 
        cb(null, `${uniqueSuffix}_${nomeLimpo}`);
    } catch (e) {
        cb(null, Date.now() + "_arquivo_seguro.pdf");
    }
  }
});
const upload = multer({ 
    storage: superStorage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB Limite
});

// --- 5. MIDDLEWARES DE AUTENTICAÇÃO ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (token == null) return res.status(401).json({ error: 'Token necessário' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user; 
    next();
  });
};

const checkRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || req.user.funcao !== requiredRole) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        next();
    };
};

// ==================================================================
//                            ROTAS
// ==================================================================

app.get('/api/categorias', (req, res) => {
  const sql = `SELECT categorias.*, COUNT(protocolos.id) AS quantidade_protocolos 
               FROM categorias LEFT JOIN protocolos ON categorias.id = protocolos.categoria_id 
               GROUP BY categorias.id ORDER BY categorias.nome ASC`;
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    res.json(results);
  });
});

app.get('/api/protocolos', (req, res) => {
  const sql = `SELECT p.*, c.nome as nome_categoria FROM protocolos p 
               LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY p.titulo ASC`;
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/protocolos/massa', upload.array('arquivos_pdf', 5), (req, res) => {
    const { categoria_id } = req.body;
    const arquivos = req.files;
    if (!arquivos || arquivos.length === 0) return res.status(400).send("Nenhum arquivo enviado.");
    
    let processados = 0;
    let erros = 0;

    arquivos.forEach((file) => {
        const tituloAuto = file.originalname.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        const sql = "INSERT INTO protocolos (titulo, categoria_id, nome_arquivo_pdf, caminho_imagem_capa) VALUES (?, ?, ?, '')";
        connection.query(sql, [tituloAuto, categoria_id, file.filename], (err) => {
            if (err) erros++; 
            processados++;
            if (processados === arquivos.length) {
                res.status(200).json({ message: `Concluído.` });
            }
        });
    });
});

app.post('/api/protocolos', authenticateToken, upload.fields([{ name: 'arquivo_pdf', maxCount: 1 }, { name: 'pdf', maxCount: 1 }, { name: 'imagem_capa', maxCount: 1 }]), (req, res) => {
  try {
      const { titulo, categoria_id } = req.body;
      const arquivoPdf = req.files['arquivo_pdf'] ? req.files['arquivo_pdf'][0] : (req.files['pdf'] ? req.files['pdf'][0] : null);
      const arquivoCapa = req.files['imagem_capa'] ? req.files['imagem_capa'][0] : null;

      if (!arquivoPdf) return res.status(400).json({ error: 'Arquivo PDF obrigatório.' });

      const sql = "INSERT INTO protocolos (titulo, categoria_id, nome_arquivo_pdf, caminho_imagem_capa) VALUES (?, ?, ?, ?)";
      const capaNome = arquivoCapa ? arquivoCapa.filename : '';

      connection.query(sql, [titulo, categoria_id, arquivoPdf.filename, capaNome], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro no Banco: " + err.message });
        res.status(201).json({ id: result.insertId });
      });

  } catch (error) {
      res.status(500).json({ error: "Erro interno no código." });
  }
});

// --- [CORREÇÃO] ROTA DELETAR MAIS INTELIGENTE (Cascata Manual) ---
app.delete('/api/protocolos/:id', authenticateToken, (req, res) => {
  const idProtocolo = req.params.id;

  // 1. Primeiro, removemos qualquer favorito ligado a este protocolo
  connection.query("DELETE FROM favoritos WHERE protocolo_id = ?", [idProtocolo], (errFav) => {
      if (errFav) {
          console.error("Erro ao limpar favoritos:", errFav);
          // Mesmo se der erro no favorito, tentamos seguir ou paramos? Melhor parar.
          return res.status(500).json({ error: "Erro ao limpar favoritos do protocolo." });
      }

      // 2. Agora que está "solto", removemos o protocolo
      connection.query("DELETE FROM protocolos WHERE id = ?", [idProtocolo], (errProto) => {
          if (errProto) return res.status(500).send(errProto);
          res.json({ message: "Protocolo e seus vínculos deletados com sucesso!" });
      });
  });
});

app.post('/api/categorias', authenticateToken, checkRole('admin_master'), upload.single('imagem'), (req, res) => {
  const { nome } = req.body; 
  const imagem = req.file ? req.file.filename : null;
  connection.query("INSERT INTO categorias (nome, nome_imagem_capa) VALUES (?, ?)", [nome, imagem], (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: r.insertId });
  });
});

app.delete('/api/categorias/:id', authenticateToken, checkRole('admin_master'), (req, res) => {
    connection.query("DELETE FROM categorias WHERE id = ?", [req.params.id], (err) => {
      res.status(200).json({ message: 'Deletado' });
    });
});

app.post('/api/favoritos', authenticateToken, (req, res) => {
    const { protocolo_id } = req.body;
    connection.query("INSERT INTO favoritos (usuario_id, protocolo_id) VALUES (?, ?)", [req.user.id, protocolo_id], (err, r) => {
        if (err) return res.status(409).json({ error: 'Erro ou duplicado' });
        res.status(201).json({ id: r.insertId });
    });
});

app.get('/api/favoritos/meus', authenticateToken, (req, res) => {
    const sql = `SELECT p.*, f.id AS favorito_id FROM protocolos p JOIN favoritos f ON p.id = f.protocolo_id WHERE f.usuario_id = ? ORDER BY p.titulo ASC`;
    connection.query(sql, [req.user.id], (err, results) => res.json(results));
});

app.delete('/api/favoritos/:protocolo_id', authenticateToken, (req, res) => {
    connection.query("DELETE FROM favoritos WHERE usuario_id = ? AND protocolo_id = ?", [req.user.id, req.params.protocolo_id], (err) => {
        res.json({ message: 'Removido' });
    });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  connection.query("SELECT * FROM usuarios WHERE username = ?", [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Inválido' });
    const match = await bcrypt.compare(password, results[0].password_hash);
    if (!match) return res.status(401).json({ error: 'Inválido' });
    const token = jwt.sign({ id: results[0].id, username: results[0].username, funcao: results[0].funcao }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ message: 'Login ok', token });
  });
});

app.get(/(.*)/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// --- MIDDLEWARE DE ERRO GLOBAL ---
app.use((err, req, res, next) => {
    console.error("🔥 [ERRO FATAL CAPTURADO]:", err);
    res.status(500).json({ error: "Erro interno fatal", details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em: http://192.168.0.201:${PORT}`);
});