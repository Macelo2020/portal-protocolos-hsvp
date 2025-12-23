// service-installer.js (Versão Corrigida v11.0)
const svc = require('node-windows').Service;
const path = require('path'); // Importar path para gerenciar caminhos

// Cria o objeto do serviço
const service = new svc({
  name: 'PortalProtocolosHSVP',
  description: 'Servidor Node.js para o Portal de Protocolos do Hospital.',
  // USAR CAMINHO DINÂMICO (Funciona em qualquer pasta/usuário)
  script: path.join(__dirname, 'index.js'), 
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096' // 4GB de RAM
  ]
});

// Eventos
service.on('install', function(){
  service.start();
  console.log('✅ Serviço instalado e iniciado com sucesso!');
  console.log('📍 Caminho do script:', path.join(__dirname, 'index.js'));
});

service.on('alreadyinstalled', function(){
  console.log('⚠️ Este serviço já está instalado.');
  service.start();
});

service.on('start', function(){
  console.log('🚀 O servidor está rodando na porta 3001.');
});

// Instalação
service.install();