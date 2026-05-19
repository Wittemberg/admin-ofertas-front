# admin-ofertas-front — Documentação Técnica

Frontend SPA React 19 + Vite 8 + TailwindCSS 4.
Painel administrativo para gestão de produtos, filiais, categorias, ofertas e configurações do sistema.
Consome API do repositório api-ofertas.

---

## Visão Geral

Painel multi-tenant com as seguintes funcionalidades:

- CRUD completo de produtos, filiais, categorias e ofertas
- Importação CSV em lote (ofertas, filiais, categorias)
- Dashboard com métricas e gráficos
- Exportação de relatórios CSV
- Gerenciamento de API Keys para integração com ERPs
- Super Admin System — configurações do sistema com auditoria

---

## Stack

- **React** ^19.2.6 — Framework UI
- **Vite** ^8.0.12 — Build tool
- **TailwindCSS** ^4.3.0 — CSS
- **React Router DOM** ^7.15.1 — Rotas
- **Axios** ^1.16.1 — HTTP
- **@tailwindcss/vite** ^4.3.0 — Plugin Vite
- **ESLint** ^10.3.0 — Linter

---

## Páginas

**Login** (`/login` — Login.jsx)
Formulário de autenticação. Envia POST /auth/login, recebe JWT e armazena no localStorage.

**Dashboard** (`/` — Dashboard.jsx)
Métricas em 4 cards (Produtos, Lojas, Categorias, Ofertas), totalizador de ofertas em destaque, gráfico de barras "Ofertas por Loja", gráfico "Produtos por Categoria", atalhos de navegação para todas as páginas.

**Produtos** (`/produtos` — Products.jsx)
Tabela com busca, paginação de 10 itens e modal de cadastro/edição. Cada produto possui código interno, código de barras (EAN), nome, descrição, imagem, unidade e categoria.

**Filiais** (`/filiais` — Stores.jsx)
Tabela com Nome, Slug, Cidade, Estado, Telefone e Status. Slug gerado automaticamente a partir do nome.

**Categorias** (`/categorias` — Categories.jsx)
Tabela com Nome, Slug e Status. CRUD completo.

**Ofertas** (`/ofertas` — Offers.jsx)
Listagem com filtros por loja, produto e ofertas em destaque.

**Importar CSV** (`/importar` — ImportCSV.jsx)
Três abas (Ofertas, Filiais, Categorias) com drag-and-drop, validações e feedback de linhas importadas, puladas, erros e warnings.

**Relatórios** (`/relatorios` — Reports.jsx)
Três cards de download CSV: ofertas vigentes, produtos sem oferta ativa e lojas inativas.

**API Keys** (`/api-keys` — ApiKeys.jsx)
Gerenciamento de chaves de integração: criar, listar, revogar e copiar chave para área de transferência.

**Super Admin** (`/super-admin/configuracoes` — SuperAdminConfig.jsx)
CRUD de configurações do sistema organizado por categorias: Storage, Database, Geral e Email.

---

## Super Admin System

### Guard de Segurança

Duas camadas de proteção:

1. **Rota protegida** — ProtectedRoute exige token JWT válido (usuário logado). Sem token, redireciona para /login.
2. **Guard de role** — Dentro do componente, verifica se user.role é igual a "superadmin". Caso contrário, renderiza tela de "Acesso Restrito".

O guard é implementado assim no componente:
if (user?.role !== 'superadmin') {
return tela de bloqueio com mensagem "Apenas administradores master podem acessar esta página."
}


Usuários com role "admin" (como admin@portonovo.com) não passam — veem apenas a tela de bloqueio. Apenas role "superadmin" (ex: superadmim@wrtec.com.br) tem acesso ao conteúdo.

### Funcionalidades da Tela

- **Abas por categoria** — Storage, Database, Geral, Email
- **Listagem** — Tabela com key, valor editável e badge de campo secreto
- **Edição inline** — Input textual com botão "Salvar" individual por registro
- **Exclusão** — Botão de lixeira com confirmação via confirm()
- **Criação** — Formulário com campos: categoria (select), key, valor, is_secret (checkbox) e descrição
- **Cache** — Botão "Recarregar Cache" que chama POST /admin/config/reload
- **Campos secretos** — Exibem "••••••••" com toggle de olho para revelar/ocultar

### API Module (src/api/admin.js)

getConfigs()              -> GET    /admin/config
getConfigsByCategory()    -> GET    /admin/config/:category
updateConfig()            -> PUT    /admin/config/:category/:key
createConfig()            -> POST   /admin/config
deleteConfig()            -> DELETE /admin/config/:category/:key
reloadCache()             -> POST   /admin/config/reload


---

## API — Configuração (src/api/axios.js)

Instância Axios com:

- baseURL apontando para a URL da API (definida via variável de ambiente)
- Interceptor de request que injeta o token JWT do localStorage no header Authorization
- Interceptor de response que trata 401 automaticamente (remove token e redireciona para /login)

Módulos de API organizados por domínio: auth.js, admin.js e CRUDs específicos de cada entidade.

---

## Autenticação

**AuthContext.jsx** — Provider que carrega os dados do usuário via GET /auth/me ao montar a aplicação. Se o token existir no localStorage, faz a requisição e armazena o usuário no estado. Se falhar (token inválido/expirado), remove o token.

**useAuth()** — Hook que retorna { user, setUser, loading }.

**ProtectedRoute** — Componente wrapper que envolve rotas privadas. Verifica se user existe. Se não, redireciona para /login.

**localStorage** — Token JWT armazenado na chave "token".

**Logout** — Remove token do localStorage e limpa o estado user.

---

## Docker

Build multi-stage em duas etapas:

Etapa 1 (builder): node:20-alpine
Copia todo o código
Executa npm install
Executa npm run build (gera pasta dist/)
Etapa 2 (serving): nginx:alpine
Copia a pasta dist/ da etapa anterior para /usr/share/nginx/html
Copia nginx.conf personalizado para /etc/nginx/conf.d/default.conf


O nginx.conf possui fallback para index.html (necessário para SPA routing com React Router) e configuração de cache para assets estáticos.

---

## CI/CD

Push na branch main
-> GitHub Actions detecta o push
-> Build da imagem Docker (Dockerfile multi-stage)
-> Push da imagem para ghcr.io/wittemberg/admin-ofertas-front:latest
-> Webhook disparado para o Portainer
-> Portainer faz pull da nova imagem e redeploy no Docker Swarm


---

## Deploy

- **Orquestração:** Docker Swarm
- **Proxy reverso:** Traefik com certificado Let's Encrypt
- **URL:** https://admin-ofertas.wrtec.com.br

---

## Histórico de Versões

- **18/05/2026** — Documentação inicial gerada
- **19/05/2026** — Adicionado Super Admin System, guard de role superadmin, rota /super-admin/configuracoes e src/api/admin.js

