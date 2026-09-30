# 🏥 Portal de Protocolos Internos - HSVP

Sistema Full Stack desenvolvido para o **Hospital São Vicente de Paulo**, centralizando o acesso aos Protocolos Operacionais Padrão (POPs) para médicos e colaboradores via Computador e Dispositivos Móveis.

![Versão](https://img.shields.io/badge/Versão-3.6.0-blue)
![Arquitetura](https://img.shields.io/badge/Arquitetura-Unified_Server-success)
![Status](https://img.shields.io/badge/Status-Estável-green)

---

## 🚀 Histórico de Versões

### v3.6.0 (Atual - Identidade Visual Dinâmica & UX Avançada)
* 🖼️ **Gestão de Capas Padrão Globais no Topo:** O painel de identidade visual foi relocado para o início da página administrativa, eliminando a necessidade de rolagem excessiva (*scroll*) e otimizando a eficiência do gestor.
* 🛣️ **Rotas Dedicadas no Backend:** Criação de endpoints específicos (`/api/configuracoes/capa-padrao-categoria` e `/api/configuracoes/capa-padrao-protocolo`) para assegurar um fluxo de upload limpo e imune a conflitos de parâmetros.
* 🔄 **Fallback Inteligente de Capas:** Categorias e protocolos criados sem imagem individual assumem instantaneamente a capa padrão global configurada, substituindo os antigos placeholders textuais por padrões visuais corporativos institucionais.
* ⚡ **Cache Busting Integrado:** Atualização visual imediata em tempo real no portal sem necessidade de limpeza manual de cache nos navegadores dos utilizadores.

### v3.1.4 (Exclusão Inteligente & Gestão de Integridade)
* 🛡️ **Segurança Relacional (Integridade Referencial):** Restrição preventiva em cascata no motor de exclusão de categorias para evitar ficheiros PDF órfãos.
* ⚡ **Exclusão em Lote Controlada (UX/UI):** Confirmação contextual em dois passos para remoção segura de categorias ocupadas.

### v3.1.3 (Governança de Infraestrutura & DNS)
* 🌐 **Governança de Rede:** Migração do Hostname para o padrão corporativo definitivo (`DIWGP-0004`).
* 🛣️ **Resolução de Nomes (DNS):** Validação do CNAME `protocolos.saovicente.lan` no Active Directory (`IWGP-ADDS02`).

### v3.1.2 (Auto-Detect, Grid Fix & Infra)
* **🌐 Resiliência de Rede:** Configuração de acesso via Hostname (`http://protocolos.saovicente.lan:3001/`) no Portal principal.
* **📱 Grid Responsivo:** Otimização dos cartões utilizando `auto-fill` e `aspect-ratio` para evitar distorções em telas menores.

---

## 📸 Galeria do Sistema

Aqui estão algumas telas do sistema em funcionamento[cite: 30]:

### 🏠 Acesso Público e Leitura
| Tela de Login | Tela Inicial (Home) |
| :---: | :---: |
| ![Login](screenshots/login.png) | ![Home](screenshots/home.png) |

### ⭐ Funcionalidades do Usuário
| Meus Favoritos | Visualização Mobile |
| :---: | :---: |
| ![Favoritos](screenshots/favoritos.png) | *Interface Responsiva*[cite: 30] |

### ⚙️ Painel Administrativo
| Gestão de Categorias | Gestão de Protocolos |
| :---: | :---: |
| ![Admin Categorias](screenshots/admin-categorias.png) | ![Admin Protocolos](screenshots/admin-protocolos.png) |

---

## 📋 Como Rodar o Projeto

### Inicialização Automática
O sistema roda em segundo plano através do **PM2**[cite: 30].

* **Acesso Oficial na Intranet (Recomendado):** http://protocolos.saovicente.lan:3001/[cite: 30]
* **Acesso no Servidor Físico (Local):** http://localhost:3001[cite: 30]

---

## 🔄 Como Atualizar (Deploy)

Sempre que alterar o código, siga este passo único[cite: 30]:

1. Vá até a pasta raiz do projeto[cite: 30].
2. Dê um duplo clique no arquivo[cite: 30]:
   👉 **`DEPLOY_AUTOMATICO.bat`**[cite: 30]
3. Aguarde a janela preta fechar[cite: 30].

---

## 🛡️ Backup e Segurança

**Como fazer o Backup[cite: 30]:**
1. Execute o arquivo[cite: 30]: 👉 **`BACKUP_TOTAL_V3.bat`**[cite: 30]
2. O script salvará tudo em `C:\Backups_Portal` e `E:\BlueFrog\Backups_Portal`[cite: 30].

---

## 👤 Autor

**Marcelo Santos**  
*Desenvolvedor Full Stack & TI no Hospital São Vicente de Paulo*[cite: 30]  
"Blue Frog Smart Solutions" 🐸💙[cite: 30]

---
© 2026 Hospital São Vicente de Paulo. Todos os direitos reservados[cite: 30].