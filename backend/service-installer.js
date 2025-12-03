// service-installer.js
// Script para instalar o serviço do Windows
const svc = require('node-windows').Service;

// Define o caminho para o seu node.js e o script de inicialização
const service = new svc({
  name: 'PortalProtocolosHSVP', // Nome do serviço no Windows
  description: 'Servidor Node.js para o Portal de Protocolos do Hospital.',
  // (CORRIGIDO!) O caminho correto para o seu usuário (com barras duplas)
  script: 'C:\\Users\\marcelo.santos\\Documents\\portal-protocolos\\backend\\index.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096' // Aloca mais memória (4GB)
  ]
});

// Listener para quando o serviço for instalado
service.on('install',function(){
  service.start();
  console.log("Serviço instalado com sucesso e iniciado!");
});

// Listener para quando o serviço for removido
service.on('uninstall',function(){
  console.log('Serviço desinstalado.');
  console.log('O Portal Protocolos HSVP foi removido da inicialização automática.');
});

// Instala o serviço
service.install();