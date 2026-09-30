# 📋 Especificação Técnica Oficial do Projeto - Portal de Protocolos HSVP

* **Título do Projeto:** Portal de Protocolos Internos - Hospital São Vicente de Paulo (HSVP)
* **Versão Atual:** 3.6.0 (Estável)
* **Autor / Desenvolvedor:** Marcelo Santos (Blue Frog Smart Solutions 🐸💙)

---

## 🏛️ 1. Visão Geral e Objetivo do Projeto
O **Portal de Protocolos HSVP** é uma solução Full Stack corporativa desenvolvida para centralizar, gerenciar e otimizar o acesso aos Protocolos Operacionais Padrão (POPs) e documentos clínicos por médicos, enfermeiros e colaboradores do hospital, tanto em computadores quanto em dispositivos móveis na intranet.

---

## 🧭 2. Diretrizes, Missão e Metodologia do Agente
Este projeto é desenvolvido sob a diretriz de IA colaborativa de alta performance, focada em programação, inovação, boas práticas de engenharia de software e experiência do utilizador:
* **Criação de Código Completo e Comentado:** Todos os módulos e funções possuem comentários detalhados em português explicando a lógica de funcionamento.
* **Método Educativo e Instruções Detalhadas:** Explicação passo a passo para facilitar a implementação e manutenção do sistema.
* **Foco Absoluto em UX/UI Design:** O UX garante fluxos lógicos e intuitivos (como o posicionamento estratégico do painel de identidade visual no topo), enquanto o UI assegura uma interface limpa, corporativa e agradável para o utilizador final.
* **Protocolo de Desenvolvimento de Software:** Validação prévia de arquitetura, blocos comentados, comandos rápidos de suporte (`/debug`, `/doc`, `/melhorar`) e preservação de contexto.

---

## ⚙️ 3. Arquitetura de Tecnologia & Infraestrutura
* **Backend:** Node.js com Express 5, estruturado como um servidor unificado que serve tanto a API RESTful quanto os ficheiros estáticos do frontend.
* **Base de Dados:** MySQL (XAMPP v3306), contendo as tabelas normalizadas para `protocolos`, `categorias`, `favoritos` e `usuarios`.
* **Frontend:** React.js com Vite, utilizando CSS moderno, foco em grid responsivo (`auto-fill` e `aspect-ratio`) e design híbrido otimizado para desktop e toque mobile.
* **Segurança e Resiliência:** Autenticação baseada em JSON Web Tokens (JWT), encriptação de passwords com `bcryptjs`, gestão segura de uploads binários via `Multer` e persistência de serviços em segundo plano com **PM2**.
* **Governança de Rede:** Acesso estabilizado na intranet através de Hostname corporativo (`http://protocolos.saovicente.lan:3001/`).

---

## 🎨 4. Otimizações de UX/UI da Versão 3.6.0
* **Acessibilidade Imediata (Painel Administrativo):** O painel de gestão de capas padrão globais foi estrategicamente posicionado no **topo** da página de administração, eliminando a necessidade de rolagem excessiva (*scroll*) e agilizando o fluxo de trabalho do gestor.
* **Fallback Inteligente de Identidade Visual:** Categorias e protocolos criados sem imagem individual assumem de forma automática e instantânea a capa padrão global correspondente (`default_categoria.png` ou `default_protocolo.png`), mantendo a uniformidade corporativa e eliminando placeholders textuais.
* **Cache Busting em Tempo Real:** Atualizações visuais instantâneas aplicadas de imediato nos cartões do portal sem exigir limpeza manual de cache nos navegadores dos utilizadores.

---

## 📂 5. Módulos e Endpoints Principais da API

| Método | Endpoint | Descrição / Função |
| :--- | :--- | :--- |
| `GET` | `/api/categorias` | Lista todas as categorias com contagem em tempo real de protocolos. |
| `POST` | `/api/categorias` | Regista uma nova categoria com suporte opcional a capa personalizada. |
| `DELETE` | `/api/categorias/:id` | Exclusão inteligente com verificação relacional de integridade (proteção contra órfãos). |
| `GET` | `/api/protocolos` | Retorna o diretório completo de protocolos associados às categorias. |
| `POST` | `/api/protocolos` | Registo individual de protocolo com PDF e capa opcional. |
| `POST` | `/api/protocolos/massa` | Envio em lote (até 5 ficheiros PDF simultâneos). |
| `POST` | `/api/configuracoes/capa-padrao-categoria` | Atualiza a identidade visual global padrão para categorias. |
| `POST` | `/api/configuracoes/capa-padrao-protocolo` | Atualiza a identidade visual global padrão para protocolos. |

---

## 🛡️️ 6. Governança, Automação e Segurança de Dados
* **Deploy Automatizado:** Script em lote (`DEPLOY_AUTOMATICO.bat`) que executa o build do React, limpa os diretórios públicos do servidor e reinicia o PM2 de forma atômica.
* **Rotina de Redundância (Backup):** Script `BACKUP_TOTAL_V3.bat` para espelhamento simultâneo do banco de dados e binários nas pastas `C:\Backups_Portal` e `E:\BlueFrog\Backups_Portal`.

---
© 2026 Hospital São Vicente de Paulo. Todos os direitos reservados. Blue Frog Smart Solutions 🐸💙