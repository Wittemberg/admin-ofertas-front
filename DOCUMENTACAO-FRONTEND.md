# 🖥️ admin-ofertas-front — Documentação Técnica

> Frontend SPA React 19 + Vite 8 + TailwindCSS 4

## 📋 Visão Geral

Administrativo para gestão de produtos, filiais, categorias e ofertas. Consome API do repositório api-ofertas. Importação CSV em lote.

## 🛠️ Stack

| Tecnologia | Versão | Função |
|---|---|---|
| React | ^19.2.6 | Framework UI |
| Vite | ^8.0.12 | Build tool |
| TailwindCSS | ^4.3.0 | CSS |
| React Router DOM | ^7.15.1 | Rotas |
| Axios | ^1.16.1 | HTTP |
| @tailwindcss/vite | ^4.3.0 | Plugin |
| ESLint | ^10.3.0 | Linter |

## 📁 Estrutura

api/: axios.js | products.js | stores.js | categories.js | offers.js
context/: AuthContext.jsx
pages/: Login.jsx | Dashboard.jsx | Products.jsx | Stores.jsx | Categories.jsx | Offers.jsx | ImportCSV.jsx
Raiz: App.jsx | Dockerfile | nginx.conf | package.json | vite.config.js

## 🧩 Páginas

- **Login.jsx** — Form + POST /auth/login + JWT
- **Dashboard.jsx** — Métricas + navegação
- **Products.jsx** — Tabela + busca + paginação 10 + modal CRUD
- **Stores.jsx** — Tabela (Nome, Slug, Cidade, Estado, Telefone, Status) + autoslug
- **Categories.jsx** — Tabela (Nome, Slug, Status) + CRUD
- **Offers.jsx** — Listagem + filtros
- **ImportCSV.jsx** — 3 abas (Ofertas/Filiais/Categorias) + drag-drop + feedback

## 🔌 API Layer

axios.js: baseURL + interceptor JWT + handler 401
Módulos: get / getById / create / update / delete

## 🔐 Autenticação

AuthContext + ProtectedRoute + localStorage + logout

## 🐳 Docker

Multi-stage: node:20-alpine (build) -> nginx:alpine (serve)
nginx.conf: fallback index.html + cache

## 🔄 CI/CD

Push main -> GitHub Actions -> ghcr.io -> Portainer -> Swarm

## 🌐 Deploy

Docker Swarm + Traefik + Let's Encrypt
URL: admin-ofertas.wrtec.com.br

---
Documentação gerada em 18/05/2026.