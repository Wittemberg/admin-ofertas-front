# 🖥️ admin-ofertas-front — Documentação Técnica

> Frontend SPA React 19 + Vite 8 + TailwindCSS 4

## 📋 Visão Geral

Painel administrativo para gestão de produtos, filiais, categorias e ofertas. Consome API do repositório api-ofertas. Importação CSV em lote.

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

admin-ofertas-front/
.github/workflows/       CI/CD
src/api/
axios.js               Axios + interceptors
products.js            CRUD produtos
stores.js              CRUD filiais
categories.js          CRUD categorias
offers.js              CRUD ofertas
src/context/
AuthContext.jsx        autenticação JWT
src/pages/
Login.jsx              tela de login
Dashboard.jsx          dashboard + navegação
Products.jsx           CRUD produtos
Stores.jsx             CRUD filiais
Categories.jsx         CRUD categorias
Offers.jsx             listagem ofertas
ImportCSV.jsx          importação CSV
src/App.jsx              rotas + ProtectedRoute
Dockerfile               multi-stage build
nginx.conf               fallback SPA
package.json
vite.config.js


## 🧩 Páginas

**Login.jsx** — formulário → POST /auth/login → JWT
**Dashboard.jsx** — métricas + atalhos
**Products.jsx** — tabela, busca, paginação 10, modal CRUD
**Stores.jsx** — tabela (Nome, Slug, Cidade, Estado, Telefone, Status), autoslug
**Categories.jsx** — tabela (Nome, Slug, Status), CRUD
**Offers.jsx** — listagem, filtros store/product/featured
**ImportCSV.jsx** — 3 abas (Ofertas/Filiais/Categorias), drag-drop, feedback

## 🔌 API

axios.js: baseURL + interceptor JWT + handler 401
Módulos: get / getById / create / update / delete

## 🔐 Autenticação

AuthContext + ProtectedRoute + localStorage + logout

## 🐳 Docker

Multi-stage: node:20-alpine (build) → nginx:alpine (serve)
nginx.conf: fallback index.html + cache

## 🔄 CI/CD

Push main → GitHub Actions → ghcr.io → Portainer → Swarm

## 🌐 Deploy

Docker Swarm + Traefik + Let's Encrypt
URL: admin-ofertas.wrtec.com.br

---
Documentação gerada em 18/05/2026.
