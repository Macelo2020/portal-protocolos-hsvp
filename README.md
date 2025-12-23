# 🏥 Portal de Protocolos Internos - HSVP

Sistema Full Stack desenvolvido para o **Hospital São Vicente de Paulo**, centralizando o acesso aos Protocolos Operacionais Padrão (POPs) para médicos e colaboradores via Computador e Dispositivos Móveis.

![Versão](https://img.shields.io/badge/Versão-3.1.0-blue)
![Arquitetura](https://img.shields.io/badge/Arquitetura-Unified_Server-success)
![Status](https://img.shields.io/badge/Status-Estável-green)

---

## 🚀 O Que Há de Novo na v3.1.0? (Visual Upgrade)

Esta versão foca na experiência do usuário (UX) e refinamento visual, além da infraestrutura unificada.

* **✨ Visual Moderno:** Efeitos de "levitação" e brilho (Glow) nas capas dos protocolos.
* **🎨 Admin Otimizado:** Painel administrativo com imagens ajustadas, formulários alinhados e barra de busca integrada.
* **⚡ Servidor Unificado:** O **Node.js** gerencia API e Site, sem dependência do Apache.
* **🛡️ Backup Redundante:** Sistema de segurança que salva dados no Disco Local e Externo simultaneamente.
* **🤖 Deploy Automático:** Script de atualização de um clique.

---

## 📋 Como Rodar o Projeto

### Inicialização Automática
O sistema roda em segundo plano através do **PM2**.

* **Acesso no Servidor:** `http://localhost:3001`
* **Acesso na Rede:** `http://192.168.0.201:3001`

---

## 🔄 Como Atualizar (Deploy)

Sempre que alterar o código, siga este passo único:

1.  Vá até a pasta raiz do projeto.
2.  Dê um duplo clique no arquivo:
    👉 **`DEPLOY_AUTOMATICO.bat`**
3.  Aguarde a tela preta fechar.

---

## 🛡️ Backup e Segurança

**Como fazer o Backup:**
1.  Execute o arquivo: 👉 **`BACKUP_TOTAL_V3.bat`**
2.  O script salvará tudo em `C:\Backups_Portal` e `E:\BlueFrog\Backups_Portal`.

---

## 👤 Autor

**Marcelo Santos**
*Desenvolvedor Full Stack & TI no Hospital São Vicente de Paulo*
"Blue Frog Smart Solutions" 🐸💙

---
© 2025 Hospital São Vicente de Paulo. Todos os direitos reservados.