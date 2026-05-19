# admin-ofertas-front — Documentação Técnica

Frontend SPA React 19 + Vite 8 + TailwindCSS 4.
Painel administrativo para gestão de produtos, filiais, categorias, ofertas e configurações do sistema.
Consome API do repositório api-ofertas.

---

## Visão Geral

Painel multi-tenant com:
- CRUD completo de produtos, filiais, categorias e ofertas
- Importação CSV em lote (ofertas, filiais, categorias)
- Dashboard com métricas e gráficos
- Exportação de relatórios CSV
- Gerenciamento de API Keys para integração com ERPs
- Configurações da Empresa (branding, contato, endereço, redes, horários)
- Super Admin System — configurações do sistema com auditoria

---

## Stack

| Vite | ^8.0.12 | Build tool |
| React Router DOM | ^7.15.1 | Rotas |
| @tailwindcss/vite | ^4.3.0 | Plugin Tailwind |

---

## Páginas

### Login (/login — Login.jsx)
Formulário de autenticação. Envia POST /auth/login, recebe JWT e armazena no localStorage.

### Dashboard (/ — Dashboard.jsx)
Métricas em 4 cards (Produtos, Lojas, Categorias, Ofertas), totalizador de ofertas em destaque, gráficos de barras "Ofertas por Loja" e "Produtos por Categoria", atalhos de navegação.

### Produtos (/produtos — Products.jsx)
Tabela com busca, paginação 10 itens e modal de cadastro/edição. Campos: código interno, EAN, nome, descrição, imagem, unidade, categoria. Upload de imagem via MinIO S3.

### Filiais (/filiais — Stores.jsx)
Tabela com Nome, Slug, Cidade, Estado, Telefone, Status. Slug gerado automaticamente.

### Categorias (/categorias — Categories.jsx)
Tabela com Nome, Slug, Status. CRUD completo.

### Ofertas (/ofertas — Offers.jsx)
Listagem com filtros por loja, produto e ofertas em destaque.

### Importar CSV (/importar — ImportCSV.jsx)
Três abas (Ofertas, Filiais, Categorias) com drag-and-drop, validações e feedback detalhado.

### Relatórios (/relatorios — Reports.jsx)
Três cards de download CSV: ofertas vigentes, produtos sem oferta, lojas inativas.

### API Keys (/api-keys — ApiKeys.jsx)
Gerenciamento de chaves de integração: criar, listar, revogar e copiar para área de transferência.

### Configurações da Empresa (/configuracoes — TenantSettings.jsx)
Seis abas de configuração:
- Informações — Nome, descrição, domínio do site público
- Contato — Telefone, e-mail, WhatsApp
- Endereço — Rua, número, cidade, estado, CEP
- Branding — Upload de logo, paleta de cores (primária, secundária, destaque, fundo, texto), fonte, preview ao vivo do site
- Redes Sociais — Instagram, Facebook, YouTube, TikTok
- Horários — Tabela de dias com abertura/fechamento

### Super Admin — Configurações (/super-admin/configuracoes — SuperAdminConfig.jsx)
CRUD de configurações do sistema por abas: Storage, Database, Geral, Email.
- Edição inline com salvamento individual
- Criação de nova configuração
- Exclusão com confirmação
- Campos secretos mascarados com toggle
- Botão Recarregar Cache e botão Auditoria
- Link Voltar ao Dashboard
- Guard de segurança (role superadmin)

### Super Admin — Auditoria (/super-admin/auditoria — SuperAdminAudit.jsx)
Tabela de logs com Data/Hora, Ação, Entidade, Valor Antigo, Valor Novo, IP.
Filtros por ação e entidade, paginação, link Voltar ao Super Admin, guard de segurança.

---

## Site Público — app-ofertas

O frontend público do consumidor final é um projeto separado:
- Repositório: https://github.com/Wittemberg/app-ofertas
- Stack: React 19 + Vite 8 + TailwindCSS 4 (mesmo stack)
- Arquitetura: Single SPA multi-tenant com CNAME por cliente
- Domínio: app-ofertas.wrtec.com.br
- API sem auth: GET /api/public/tenant, /offers, /products, /stores, /categories
- Veja DOCUMENTACAO-APP-OFERTAS.md para detalhes completos

---

## Super Admin System — Guard de Segurança (duas camadas)

1. Rota protegida — ProtectedRoute exige token JWT. Sem token → /login.
2. Guard interno — Verifica user.role === superadmin. Se falhar → tela "Acesso Restrito" com link Voltar ao Dashboard.

Usuários role admin (ex: admin@portonovo.com) não passam. Apenas superadmin (ex: superadmim@wrtec.com.br) acessa.

---

## API Module (src/api/admin.js)

- getConfigs() — GET /admin/config
- getConfigsByCategory(category) — GET /admin/config/:category
- updateConfig(category, key, data) — PUT /admin/config/:category/:key
- createConfig(data) — POST /admin/config
- deleteConfig(category, key) — DELETE /admin/config/:category/:key
- reloadCache() — POST /admin/config/reload

---

## Axios — Configuração (src/api/axios.js)

Instância Axios com baseURL via env, interceptor de request que injeta token JWT do localStorage, interceptor de response que trata 401 (remove token e redireciona para /login).

---

## Autenticação

| Componente | Função 
| ProtectedRoute | Envolve rotas privadas, redireciona para /login |
| Logout | Remove token + limpa estado |

---

## Docker

Multi-stage: node:20-alpine (builder) → nginx:alpine (serve). nginx.conf com fallback index.html para SPA routing + cache de assets.

---

## CI/CD

Push main → GitHub Actions → build Docker → push ghcr.io/wittemberg/admin-ofertas-front:latest → webhook Portainer → redeploy Swarm.

---

## Deploy

| Item | Detalhe 
| URL | https://admin-ofertas.wrtec.com.br |

---

> Documentação gerada em 19/05/2026.