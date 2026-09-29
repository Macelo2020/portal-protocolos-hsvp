// ==================================================================
// PROJETO: Portal de Protocolos HSVP (Backend v13.3 - Exclusão Inteligente)
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
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));
app.use(express.json()); 

// --- 2. CONEXÃO COM O BANCO DE DADOS (MySQL) ---
// Mantido o nome oficial da base de dados do hospital: portal_protocolos
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

// --- 3. INFRAESTRUTURA DE PASTAS (AUTO-HEALING) ---
// Garante caminhos absolutos e impede falhas de ENOENT
const dirImages = path.join(__dirname, 'public', 'images');
const dirPdfs = path.join(__dirname, 'public', 'pdfs');

if (!fs.existsSync(dirImages)) {
    fs.mkdirSync(dirImages, { recursive: true });
    console.log('📁 Auto-Healing: Diretório public/images criado com sucesso.');
}
if (!fs.existsSync(dirPdfs)) {
    fs.mkdirSync(dirPdfs, { recursive: true });
    console.log('📁 Auto-Healing: Diretório public/pdfs criado com sucesso.');
}

// Serve arquivos estáticos enviados pelos usuários
app.use('/images', express.static(dirImages));
app.use('/pdfs', express.static(dirPdfs));

// --- 4. CONFIGURAÇÃO DE UPLOAD RESILIENTE (MULTER) ---
const superStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Encaminha capas para images e documentos clínicos para pdfs
    let targetFolder = dirPdfs;
    if (['imagem_capa', 'imagem'].includes(file.fieldname)) {
        targetFolder = dirImages;
    }
    cb(null, targetFolder);
  },
  filename: (req, file, cb) => {
    try {
        const nomeLimpo = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9.]/g, '_'); 
        cb(null, `${Date.now()}_${nomeLimpo}`);
    } catch (e) { 
        cb(null, `${Date.now()}_arquivo_seguro.bin`); 
    }
  }
});

const upload = multer({ storage: superStorage, limits: { fileSize: 50 * 1024 * 1024 } });

// --- 5. MIDDLEWARES DE AUTENTICAÇÃO E PERMISSÕES ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (token == null) return res.status(401).json({ error: 'Token de autenticação necessário.' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sessão inválida ou expirada.' });
    req.user = user; 
    next();
  });
};

const checkRole = (role) => (req, res, next) => {
    if (!req.user || req.user.funcao !== role) {
        return res.status(403).json({ error: 'Acesso negado: permissão insuficiente.' });
    }
    next();
};

// ==================================================================
// --- 6. ROTAS DA API ---
// ==================================================================

// --- CATEGORIAS ---
app.get('/api/categorias', (req, res) => {
  const query = `
    SELECT categorias.*, COUNT(protocolos.id) AS quantidade_protocolos 
    FROM categorias 
    LEFT JOIN protocolos ON categorias.id = protocolos.categoria_id 
    GROUP BY categorias.id 
    ORDER BY categorias.nome ASC
  `;
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Erro ao consultar categorias:', err);
          return res.status(500).json({ error: 'Erro ao buscar categorias.' });
      }
      res.json(results);
  });
});

app.post('/api/categorias', upload.single('imagem'), (req, res) => {
    const nome = req.body.nome;
    const imagemArquivo = req.file;

    if (!nome) {
        return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
    }

    const nomeImagem = imagemArquivo ? imagemArquivo.filename : null;

    connection.query(
        "INSERT INTO categorias (nome, nome_imagem_capa) VALUES (?, ?)", 
        [nome, nomeImagem], 
        (err, results) => {
            if (err) {
                console.error('Falha MySQL ao cadastrar categoria:', err);
                return res.status(500).json({ error: 'Falha ao salvar no banco de dados.' });
            }
            res.status(201).json({ 
                id: results.insertId, 
                nome: nome,
                nome_imagem_capa: nomeImagem,
                mensagem: 'Categoria cadastrada com sucesso!' 
            });
        }
    );
});

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
        if (err) return res.status(500).json({ error: "Erro ao atualizar categoria: " + err.message });
        res.json({ message: "Categoria atualizada com sucesso!" });
    });
});

// ==================================================================
// ROTA: Deletar Categoria Inteligente (Segurança + Exclusão em Massa)
// ==================================================================
app.delete('/api/categorias/:id', authenticateToken, checkRole('admin_master'), (req, res) => {
    const categoriaId = req.params.id;
    // Permite que o frontend force a exclusão em massa através de ?forcar=true
    const forcarExclusao = req.query.forcar === 'true';

    // 1. Consulta se existem protocolos vinculados e recolhe os nomes dos arquivos
    connection.query(
        "SELECT id, nome_arquivo_pdf FROM protocolos WHERE categoria_id = ?",
        [categoriaId],
        (errProtocolos, listaProtocolos) => {
            if (errProtocolos) {
                console.error("Erro ao consultar protocolos da categoria:", errProtocolos);
                return res.status(500).json({ error: "Erro interno ao validar protocolos da categoria." });
            }

            const total = listaProtocolos.length;

            // Se tem protocolos e o usuário ainda não confirmou em massa: bloqueia e envia mensagem clara
            if (total > 0 && !forcarExclusao) {
                return res.status(400).json({
                    possuiProtocolos: true,
                    totalProtocolos: total,
                    error: `Esta categoria possui ${total} protocolo(s) vinculado(s).`
                });
            }

            // Função interna para remoção da categoria após o encadeamento
            const concluirRemocaoCategoria = () => {
                connection.query("DELETE FROM categorias WHERE id = ?", [categoriaId], (errCat) => {
                    if (errCat) {
                        console.error("Erro ao deletar categoria:", errCat);
                        return res.status(500).json({ error: "Erro ao excluir categoria." });
                    }
                    res.json({ message: "Categoria removida com sucesso!" });
                });
            };

            // Se for exclusão confirmada de categoria com protocolos vinculados
            if (total > 0 && forcarExclusao) {
                const idsProtocolos = listaProtocolos.map(p => p.id);

                // A. Remove dependências na tabela de favoritos
                connection.query(
                    `DELETE FROM favoritos WHERE protocolo_id IN (${idsProtocolos.map(() => '?').join(',')})`,
                    idsProtocolos,
                    (errFav) => {
                        if (errFav) {
                            console.error("Erro ao remover favoritos associados:", errFav);
                            return res.status(500).json({ error: "Erro ao remover favoritos vinculados aos protocolos." });
                        }

                        // B. Remove os protocolos da categoria no banco
                        connection.query("DELETE FROM protocolos WHERE categoria_id = ?", [categoriaId], (errDelProt) => {
                            if (errDelProt) {
                                console.error("Erro ao deletar protocolos em massa:", errDelProt);
                                return res.status(500).json({ error: "Erro ao remover protocolos da categoria." });
                            }

                            // C. Limpeza no disco físico (remove arquivos PDF órfãos)
                            listaProtocolos.forEach(p => {
                                if (p.nome_arquivo_pdf) {
                                    const caminhoPdf = path.join(dirPdfs, p.nome_arquivo_pdf);
                                    if (fs.existsSync(caminhoPdf)) {
                                        fs.unlink(caminhoPdf, (errUnlink) => {
                                            if (errUnlink) console.error("Erro ao remover arquivo PDF físico:", errUnlink);
                                        });
                                    }
                                }
                            });

                            // D. Finaliza excluindo a categoria
                            concluirRemocaoCategoria();
                        });
                    }
                );
            } else {
                // Categoria sem protocolos vinculados: remoção direta
                concluirRemocaoCategoria();
            }
        }
    );
});

// --- PROTOCOLOS ---
app.get('/api/protocolos', (req, res) => {
  const query = `
    SELECT p.*, c.nome as nome_categoria 
    FROM protocolos p 
    LEFT JOIN categorias c ON p.categoria_id = c.id 
    ORDER BY p.titulo ASC
  `;
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Erro ao consultar protocolos:', err);
          return res.status(500).json({ error: 'Erro ao buscar protocolos.' });
      }
      res.json(results);
  });
});

app.post('/api/protocolos/massa', upload.array('arquivos_pdf', 5), (req, res) => {
    const { categoria_id } = req.body;
    let processados = 0;
    req.files.forEach((file) => {
        const titulo = file.originalname.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        connection.query(
            "INSERT INTO protocolos (titulo, categoria_id, nome_arquivo_pdf, caminho_imagem_capa) VALUES (?, ?, ?, '')", 
            [titulo, categoria_id, file.filename], 
            () => {
                processados++;
                if (processados === req.files.length) {
                    res.status(200).json({ message: 'Envio em lote concluído com sucesso.' });
                }
            }
        );
    });
});

app.post('/api/protocolos', authenticateToken, upload.fields([{ name: 'arquivo_pdf', maxCount: 1 }, { name: 'imagem_capa', maxCount: 1 }]), (req, res) => {
    const { titulo, categoria_id } = req.body;
    const pdf = req.files['arquivo_pdf'] ? req.files['arquivo_pdf'][0] : null;
    const capa = req.files['imagem_capa'] ? req.files['imagem_capa'][0] : null;
    
    if (!pdf) return res.status(400).json({ error: 'O documento PDF é obrigatório.' });
    
    connection.query(
        "INSERT INTO protocolos (titulo, categoria_id, nome_arquivo_pdf, caminho_imagem_capa) VALUES (?, ?, ?, ?)", 
        [titulo, categoria_id, pdf.filename, capa ? capa.filename : ''], 
        (err, r) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: r.insertId });
        }
    );
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
        if (err) return res.status(500).json({ error: "Erro ao atualizar protocolo: " + err.message });
        res.json({ message: "Protocolo atualizado com sucesso!" });
    });
});

app.delete('/api/protocolos/:id', authenticateToken, (req, res) => {
  connection.query("DELETE FROM favoritos WHERE protocolo_id = ?", [req.params.id], () => {
      connection.query("DELETE FROM protocolos WHERE id = ?", [req.params.id], (err) => {
          if (err) return res.status(500).send(err);
          res.json({ message: "Protocolo excluído com sucesso." });
      });
  });
});

// --- FAVORITOS E AUTENTICAÇÃO ---
app.post('/api/favoritos', authenticateToken, (req, res) => {
    connection.query("INSERT INTO favoritos (usuario_id, protocolo_id) VALUES (?, ?)", [req.user.id, req.body.protocolo_id], (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: r.insertId });
    });
});

app.get('/api/favoritos/meus', authenticateToken, (req, res) => {
    const query = `
      SELECT p.*, f.id AS favorito_id 
      FROM protocolos p 
      JOIN favoritos f ON p.id = f.protocolo_id 
      WHERE f.usuario_id = ? 
      ORDER BY p.titulo ASC
    `;
    connection.query(query, [req.user.id], (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(r);
    });
});

app.delete('/api/favoritos/:protocolo_id', authenticateToken, (req, res) => {
    connection.query("DELETE FROM favoritos WHERE usuario_id = ? AND protocolo_id = ?", [req.user.id, req.params.protocolo_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Removido dos favoritos.' });
    });
});

app.post('/api/login', (req, res) => {
  connection.query("SELECT * FROM usuarios WHERE username = ?", [req.body.username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Credenciais inválidas.' });
    if (!await bcrypt.compare(req.body.password, results[0].password_hash)) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const token = jwt.sign(
        { id: results[0].id, username: results[0].username, funcao: results[0].funcao }, 
        JWT_SECRET, 
        { expiresIn: '8h' }
    );
    res.json({ message: 'Login bem-sucedido.', token });
  });
});

// ==================================================================
// --- 7. SERVIR O FRONTEND REACT (ARQUITETURA UNIFICADA) ---
// ==================================================================
app.use(express.static(path.join(__dirname, 'public')));

app.get(/.*/, (req, res) => {
    if (req.url.includes('.')) {
        return res.status(404).send('Arquivo não encontrado.');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================================================================
// --- 8. INICIALIZAÇÃO DO SERVIDOR ---
// ==================================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===========================================================`);
  console.log(`🚀 SERVIDOR UNIFICADO (BACKEND + FRONTEND) RODANDO v13.3`);
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌐 Acesso Local: http://localhost:${PORT}`);
  console.log(`🌍 Acesso Rede: http://protocolos.saovicente.lan:${PORT}`);
  console.log(`===========================================================`);
});