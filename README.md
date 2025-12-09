# 🏥 Portal de Protocolos Internos - HSVP

Sistema Full Stack desenvolvido para o **Hospital São Vicente de Paulo**, visando centralizar, organizar e facilitar o acesso aos protocolos operacionais padrão (POPs) por médicos e colaboradores via Computador e Dispositivos Móveis.

![Status do Projeto](https://img.shields.io/badge/Versão-1.8.0-blue)
![Status](https://img.shields.io/badge/Status-Em_Produção-green)
![Tech](https://img.shields.io/badge/Style-Blue_Tech-0056b3)

## 📸 Visão Geral

O sistema permite a gestão completa de categorias e protocolos (PDFs), com uma interface moderna, responsiva e focada na usabilidade hospitalar. A versão atual conta com um **Dashboard Gerencial** integrado.

### ✨ Novidades da Versão 1.8.0
* **Dashboard de Métricas:** Visualização em tempo real do total de protocolos e contagem por categoria na barra lateral.
* **Badges Inteligentes:** Indicadores numéricos visuais para facilitar a navegação.
* **Visual "Blue Tech":** Redesign completo da interface (Cabeçalho degradê, Rodapé compacto e cores institucionais).
* **Acessibilidade:** Melhoria no contraste de fontes e tamanhos de ícones.

### Funcionalidades Principais
* **Painel de Leitura:** Layout dividido (Sidebar com Dashboard + Conteúdo) para fácil navegação.
* **Responsividade:** Interface adaptada para telemóveis com scroll horizontal e botões táteis.
* **Favoritos:** Sistema de favoritos pessoal por utilizador.
* **Admin:** Painel administrativo para upload de capas, PDFs e gestão de categorias.
* **Segurança:** Autenticação via Token JWT e rotas protegidas.

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
    git clone [https://github.com/Macelo2020/portal-protocolos-hsvp.git](https://github.com/Macelo2020/portal-protocolos-hsvp.git)
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