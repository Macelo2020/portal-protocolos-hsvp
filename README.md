# 🏥 Portal de Protocolos Internos - HSVP

Sistema Full Stack desenvolvido para o **Hospital São Vicente de Paulo**, visando centralizar, organizar e facilitar o acesso aos protocolos operacionais padrão (POPs) por médicos e colaboradores via Computador e Dispositivos Móveis.

![Versão](https://img.shields.io/badge/Versão-2.0.0-blue)
![Status](https://img.shields.io/badge/Status-Estável_em_Produção-green)
![Tech](https://img.shields.io/badge/Infra-Node_PM2-orange)

## 📸 Visão Geral

O sistema permite a gestão completa de categorias e protocolos (PDFs), com uma interface moderna e acesso via **Rede Local**.

### ✨ Novidades da Versão 2.0.0 (Stable)
* **Acesso em Rede:** Sistema liberado para acesso via IP (`192.168.0.201`) em qualquer máquina do hospital.
* **Servidor Blindado (PM2):** O Backend roda como serviço do Windows (background), garantindo estabilidade 24/7.
* **Upload Robusto:** Suporte para arquivos grandes (**50MB**) e higienização automática de nomes de arquivos.
* **Gestão Inteligente:** Exclusão de protocolos com limpeza automática de vínculos (Favoritos) para evitar erros.
* **Banco de Dados:** Correção de charset para aceitar títulos longos e caracteres especiais.

### Funcionalidades Principais
* **Painel de Leitura:** Layout dividido (Sidebar com Dashboard + Conteúdo).
* **Responsividade:** Interface adaptada para telemóveis e tablets.
* **Favoritos:** Sistema de favoritos pessoal por utilizador.
* **Admin:** Painel administrativo para upload de capas, PDFs e gestão de categorias.
* **Segurança:** Autenticação via Token JWT, controle de IP e rotas protegidas.

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React.js + Vite (Single Page Application)
* **Backend:** Node.js + Express (Porta 3001)
* **Banco de Dados:** MySQL (XAMPP/MariaDB)
* **Gerenciador de Processos:** PM2 (Windows Service)

---

## 📋 Guia de Manutenção do Servidor (Backend)

Como o sistema roda via **PM2**, não é necessário manter janelas abertas. Use os comandos abaixo no terminal (PowerShell ou VSCode) para manutenção:

| Ação | Comando |
| :--- | :--- |
| **Verificar Status** | `pm2 list` |
| **Ver Logs (Erros)** | `pm2 logs` |
| **Reiniciar Servidor** | `pm2 restart backend-portal` |
| **Parar Servidor** | `pm2 stop backend-portal` |

---

## 🚀 Instalação e Execução

### Pré-requisitos
* Node.js instalado
* XAMPP (MySQL rodando na porta 3306)
* PM2 instalado globalmente (`npm install -g pm2`)

### Passos para Rodar

1.  **Banco de Dados:**
    * Certifique-se que o XAMPP (MySQL) está ligado.

2.  **Backend (Servidor):**
    ```bash
    cd backend
    pm2 start index.js --name "backend-portal"
    # O servidor iniciará em background na porta 3001
    ```

3.  **Frontend (Atualização do Site):**
    ```bash
    cd frontend
    npm run build
    # Copie o conteúdo da pasta 'dist' para 'C:\xampp\htdocs\Portal'
    ```

## 👤 Autor

**Marcelo Santos** *Desenvolvedor Full Stack & TI no Hospital São Vicente de Paulo* "Blue Frog Smart Solutions" 🐸💙

---
© 2025 Hospital São Vicente de Paulo. Todos os direitos reservados.