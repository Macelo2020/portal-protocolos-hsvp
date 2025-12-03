// Professor de Programação: Backend FINAL (v3.3 - Segurança, Favoritos e Correções)
// Portal de Protocolos - HSVP

// --- 1. Importação das Ferramentas ---
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');    
const fs = require('fs'); 

// --- 2. Configuração Inicial ---
const app = express();
const PORT = 3001;
const JWT_SECRET = "minha-chave-secreta-super-dificil-123"; 

// --- 3. Configuração da Conexão com o Banco de Dados (POOL) ---
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
  keepAliveInitialDelay: 0
});

// Wrapper para manter compatibilidade
const connection = pool; 

// Teste de conexão (Isto é suficiente para o Pool)
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ ERRO CRÍTICO: Não foi possível conectar ao MySQL!', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados MySQL com sucesso! (Pool Ativo)');
    conn.release(); // Importante: devolve a conexão para o pool
  }
});

// APAGUEI O BLOCO connection.connect(...) QUE ESTAVA AQUI POIS DAVA ERRO NO POOL

// --- 5. Middlewares ---
app.use(cors());
// ... resto do código ...

// --- 5. Middlewares ---
app.use(cors());
app.use(express.json()); // Lê JSON
app.use(express.static('public')); // Serve /public (para PDFs e Imagens)

// --- 5.1. Configuração do UPLOAD (Multer) ---
const superStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'pdf') {
      cb(null, 'public/pdfs/');
    } else if (file.fieldname === 'imagem_capa' || file.fieldname === 'imagem') {
      cb(null, 'public/images/');
    } else {
      cb(new Error('Campo de arquivo desconhecido!'), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: superStorage });


// =================================================================
// MIDDLEWARES DE SEGURANÇA POR FUNÇÃO
// =================================================================

// 1. Middleware de Autenticação (Verifica token e decodifica o usuário)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Espera: 'Bearer TOKEN'

  if (token == null) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });

    req.user = user; // user agora contém { id, username, funcao }
    next();
  });
};

// 2. Middleware de Autorização (Verifica se a função do usuário é a necessária)
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || req.user.funcao !== requiredRole) {
            return res.status(403).json({ error: `Acesso negado. Necessário nível de permissão: ${requiredRole}.` });
        }
        next();
    };
};


// ==================================================================
// --- 6. ROTAS DA API ---
// ==================================================================

// --- ROTAS DE LEITURA (PÚBLICAS) ---
app.get('/api/categorias', (req, res) => {
  const sqlQuery = `
    SELECT categorias.*, COUNT(protocolos.id) AS quantidade_protocolos
    FROM categorias
    LEFT JOIN protocolos ON categorias.id = protocolos.categoria_id
    GROUP BY categorias.id
    ORDER BY categorias.nome ASC;
  `;
  connection.query(sqlQuery, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    res.json(results);
  });
});

app.get('/api/protocolos', (req, res) => {
  const sqlQuery = "SELECT * FROM protocolos ORDER BY titulo ASC";
  connection.query(sqlQuery, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/protocolos/categoria/:id', (req, res) => {
  const idDaCategoria = req.params.id;
  const sqlQuery = "SELECT * FROM protocolos WHERE categoria_id = ?";
  connection.query(sqlQuery, [idDaCategoria], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- ADMIN CATEGORIAS (PROTEGIDO POR ADMIN_MASTER) ---
app.post('/api/categorias', authenticateToken, checkRole('admin_master'), upload.single('imagem'), (req, res) => {
  const { nome } = req.body; 
  const nome_imagem_capa = req.file ? req.file.filename : null;
  if (!nome) return res.status(400).json({ error: 'Nome obrigatório' });
  
  const sqlQuery = "INSERT INTO categorias (nome, nome_imagem_capa) VALUES (?, ?)";
  connection.query(sqlQuery, [nome, nome_imagem_capa], (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Categoria já existe' });
        return res.status(500).json({ error: `Erro do banco de dados: ${err.message}` });
    }
    res.status(201).json({ id: result.insertId, nome, nome_imagem_capa });
  });
});

app.put('/api/categorias/:id', authenticateToken, checkRole('admin_master'), upload.single('imagem'), (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const novaImagem = req.file ? req.file.filename : null;
  
  let sqlQuery = "UPDATE categorias SET nome = ? WHERE id = ?";
  let sqlParams = [nome, id];

  if (novaImagem) {
    sqlQuery = "UPDATE categorias SET nome = ?, nome_imagem_capa = ? WHERE id = ?";
    sqlParams = [nome, novaImagem, id];
  }
  
  connection.query(sqlQuery, sqlParams, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, nome });
  });
});

app.delete('/api/categorias/:id', authenticateToken, checkRole('admin_master'), (req, res) => {
  const { id } = req.params;
  const selectQuery = "SELECT nome_imagem_capa FROM categorias WHERE id = ?";
  
  connection.query(selectQuery, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro interno.' });
    if (results.length === 0) return res.status(404).json({ error: 'Não encontrado.' });

    const nomeImagem = results[0].nome_imagem_capa;
    const deleteQuery = "DELETE FROM categorias WHERE id = ?";
    
    connection.query(deleteQuery, [id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao deletar.' });

      if (nomeImagem) {
        const filePath = path.join(__dirname, 'public/images', nomeImagem);
        fs.unlink(filePath, (err) => { if(err) console.warn("Erro ao apagar arquivo:", err); });
      }
      res.status(200).json({ message: 'Deletado com sucesso' });
    });
  });
});

// --- ADMIN PROTOCOLOS (PROTEGIDO POR QUALQUER AUTENTICADO) ---
app.post('/api/protocolos', authenticateToken, upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'imagem_capa', maxCount: 1 }]), (req, res) => {
  const { titulo, categoria_id } = req.body;
  const arquivoPdf = req.files['pdf'] ? req.files['pdf'][0] : null;
  const arquivoCapa = req.files['imagem_capa'] ? req.files['imagem_capa'][0] : null;

  if (!arquivoPdf || !titulo || !categoria_id) return res.status(400).json({ error: 'Campos obrigatórios faltando' });

  const sqlQuery = "INSERT INTO protocolos (titulo, categoria_id, nome_arquivo_pdf, caminho_imagem_capa) VALUES (?, ?, ?, ?)";
  connection.query(sqlQuery, [titulo, categoria_id, arquivoPdf.filename, arquivoCapa ? arquivoCapa.filename : null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId });
  });
});

app.put('/api/protocolos/:id', authenticateToken, upload.single('imagem_capa'), (req, res) => {
  const { id } = req.params;
  const { titulo, categoria_id } = req.body;
  const novaCapa = req.file ? req.file.filename : null;

  let sqlQuery = "UPDATE protocolos SET titulo = ?, categoria_id = ? WHERE id = ?";
  let sqlParams = [titulo, categoria_id, id];

  if (novaCapa) {
    sqlQuery = "UPDATE protocolos SET titulo = ?, categoria_id = ?, caminho_imagem_capa = ? WHERE id = ?";
    sqlParams = [titulo, categoria_id, novaCapa, id];
  }

  connection.query(sqlQuery, sqlParams, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/protocolos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const selectQuery = "SELECT nome_arquivo_pdf, caminho_imagem_capa FROM protocolos WHERE id = ?";
  
  connection.query(selectQuery, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro interno.' });
    if (results.length === 0) return res.status(404).json({ error: 'Não encontrado.' });

    const nomePdf = results[0].nome_arquivo_pdf;
    const nomeCapa = results[0].caminho_imagem_capa;
    const deleteQuery = "DELETE FROM protocolos WHERE id = ?";

    connection.query(deleteQuery, [id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao deletar.' });

      if (nomePdf) {
        const pdfPath = path.join(__dirname, 'public/pdfs', nomePdf);
        fs.unlink(pdfPath, (err) => { if(err) console.warn("Erro ao apagar PDF:", err); });
      }
      if (nomeCapa) {
        const capaPath = path.join(__dirname, 'public/images', nomeCapa);
        fs.unlink(capaPath, (err) => { if(err) console.warn("Erro ao apagar Capa:", err); });
      }
      
      res.status(200).json({ message: 'Deletado' });
    });
  });
});

// --- CRUD DE FAVORITOS (NOVO) ---

// (C)REATE: Adicionar um Protocolo à lista de Favoritos (PRIVADO)
app.post('/api/favoritos', authenticateToken, (req, res) => {
  const { protocolo_id } = req.body;
  const usuario_id = req.user.id; // Pegamos o ID do usuário diretamente do token

  if (!protocolo_id) {
    return res.status(400).json({ error: 'ID do protocolo é obrigatório.' });
  }

  const sqlQuery = "INSERT INTO favoritos (usuario_id, protocolo_id) VALUES (?, ?)";
  
  connection.query(sqlQuery, [usuario_id, protocolo_id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Protocolo já está nos favoritos.' });
      }
      console.error('ERRO INTERNO AO SALVAR FAVORITO:', err);
      return res.status(500).json({ error: 'Erro interno ao salvar favorito.' });
    }
    res.status(201).json({ message: 'Adicionado aos favoritos com sucesso.', id: result.insertId });
  });
});

// (R)EAD: Listar todos os Favoritos do Usuário (PRIVADO)
app.get('/api/favoritos/meus', authenticateToken, (req, res) => {
  const usuario_id = req.user.id;
  
  // Consulta que junta a tabela de protocolos com a tabela de favoritos
  const sqlQuery = `
    SELECT p.*, f.id AS favorito_id 
    FROM protocolos p
    JOIN favoritos f ON p.id = f.protocolo_id
    WHERE f.usuario_id = ?
    ORDER BY p.titulo ASC
  `;

  connection.query(sqlQuery, [usuario_id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar favoritos:', err);
      return res.status(500).json({ error: 'Erro interno ao buscar favoritos.' });
    }
    res.json(results);
  });
});

// (D)ELETE: Remover um Protocolo da lista de Favoritos (PRIVADO)
app.delete('/api/favoritos/:protocolo_id', authenticateToken, (req, res) => {
  const { protocolo_id } = req.params;
  const usuario_id = req.user.id;

  const sqlQuery = "DELETE FROM favoritos WHERE usuario_id = ? AND protocolo_id = ?";
  
  connection.query(sqlQuery, [usuario_id, protocolo_id], (err, result) => {
    if (err) {
      console.error('Erro ao remover favorito:', err);
      return res.status(500).json({ error: 'Erro interno ao remover favorito.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorito não encontrado.' });
    }
    res.status(200).json({ message: 'Removido dos favoritos com sucesso.' });
  });
});

// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sqlQuery = "SELECT * FROM usuarios WHERE username = ?";
  connection.query(sqlQuery, [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });
    const usuario = results[0];
    const senhaCorreta = await bcrypt.compare(password, usuario.password_hash);
    if (!senhaCorreta) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ id: usuario.id, username: usuario.username, funcao: usuario.funcao }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ message: 'Login ok', token });
  });
});


// ==================================================================
// --- 7. ROTA PARA O FRONTEND (SPA) - O PEGA-TUDO --
// ==================================================================

// (CORRIGIDO!) Usamos /(.*)/ em vez de '*' para evitar o erro de versão
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- 8. Iniciar o Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
  console.log(`Acesse o portal em: http://localhost:${PORT}`);
});