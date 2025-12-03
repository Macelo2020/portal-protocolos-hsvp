# 🏥 Portal de Protocolos Internos - HSVP

Sistema Full Stack desenvolvido para o **Hospital São Vicente de Paulo**, visando centralizar, organizar e facilitar o acesso aos protocolos operacionais padrão (POPs) por médicos e colaboradores via Computador e Dispositivos Móveis.

![Status do Projeto](https://img.shields.io/badge/Versão-1.6.0-green)
![Status](https://img.shields.io/badge/Status-Em_Produção-blue)

## 📸 Visão Geral

O sistema permite a gestão completa de categorias e protocolos (PDFs), com uma interface moderna estilo "Glassmorphism" e layout responsivo.

### Funcionalidades Principais
* **Painel de Leitura:** Layout dividido (Sidebar + Conteúdo) para fácil navegação.
* **Responsividade:** Interface adaptada para telemóveis com scroll horizontal e botões táteis.
* **Favoritos:** Sistema de favoritos pessoal por utilizador.
* **Admin:** Painel administrativo para upload de capas, PDFs e gestão de categorias.
* **Segurança:** Autenticação via Token JWT.

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React.js + Vite (Single Page Application)
* **Backend:** Node.js + Express
* **Banco de Dados:** MySQL (XAMPP)
* **Infraestrutura:** Servidor Apache (Deploy) + Serviço Windows (Backend)

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* Node.js instalado
* XAMPP (MySQL rodando na porta 3306)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU-USUARIO/portal-protocolos-hsvp.git](https://github.com/SEU-USUARIO/portal-protocolos-hsvp.git)
    ```

2.  **Configurar o Banco de Dados:**
    * Importe o arquivo `backup_inicial.sql` (se disponível) no phpMyAdmin.
    * Ou crie um banco chamado `portal_protocolos`.

3.  **Backend:**
    ```bash
    cd backend
    npm install
    node index.js
    ```

4.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 👤 Autor

**Marcelo Santos** *Desenvolvedor Full Stack & TI no Hospital São Vicente de Paulo* "Blue Frog Smart Solutions" 🐸💙

---
© 2025 Hospital São Vicente de Paulo. Todos os direitos reservados.