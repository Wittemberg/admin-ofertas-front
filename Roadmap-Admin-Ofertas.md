# Roadmap — Admin Ofertas

Documento central do projeto. Mantido pela IA da Adapta ONE para contexto entre sessões.

---

## Status Atual — Concluído

### Sprint 2 — Upload de Imagens (MinIO S3)
- Rota POST /upload/product/:id no backend com @aws-sdk/client-s3
- Upload para MinIO S3
- Seção de imagem no modal de edição de produtos
- Coluna "Imagem" com botão "Ver" na tabela
- Modal de preview em tela cheia
- Rotas faltantes registradas no server.js (categories, upload, dashboard)

### Sprint 3 — Dashboard com Métricas e Gráficos
- 4 cards métricos (Produtos, Lojas, Categorias, Ofertas)
- Totalizador de ofertas em destaque
- Gráfico de barras "Ofertas por Loja"
- Gráfico de barras "Produtos por Categoria"
- Navegação rápida com links para todas as páginas
- Link "Importar CSV" incluso no dashboard
- Dashboard.jsx reescrito com cards clicáveis (links)

### Sprint 4 — Exportação de Relatórios
- Endpoint GET /reports/active-offers — ofertas vigentes
- Endpoint GET /reports/without-offers — produtos sem oferta ativa
- Endpoint GET /reports/inactive-stores — filiais inativas
- Página /relatorios com 3 cards de download CSV
- Exportação CSV nativa (sem dependências, abre no Excel)
- Rota no App.jsx + link no Dashboard

### Sprint 5 — API de Integração com ERPs
- Schema: tabelas api_keys e integration_logs no PostgreSQL
- Middleware authenticateApiKey em lib/auth.js (header X-API-Key)
- Endpoint único POST /api/v1/integration/import
  - Importação em lote de stores, categories, products e offers
  - Upsert por slug (stores/categories) e internal_code/barcode (products)
  - Resolução automática de produto por código na oferta
  - Validação individual por registro (erros não bloqueiam o lote)
  - Relatório detalhado de created/updated/errors/warnings
- Idempotência via idempotency_key
- Endpoint GET /api/v1/integration/status/:idempotency_key
- Geração de API Key via POST /auth/api-keys (mostrada 1 vez)
- Listagem e revogação de chaves
- Página /api-keys no frontend com gerenciamento completo
- Cópia automática da chave para área de transferência ao clicar
- Rate limit: 10 requisições/minuto por chave
- Tabela integration_logs registra toda requisição (IP, status, sumário)

### Sprint 6 — Super Admin System
#### Infraestrutura e Segurança
- Tabela system_configs no PostgreSQL (criada manualmente)
- Tabela audit_logs no PostgreSQL (criada manualmente)
- Models system_configs e audit_logs no prisma/schema.prisma
- lib/config.js — cache + CRUD (getAllConfigs, setConfig, deleteConfig, invalidateCache)
- Chain de resolução: Banco → Env vars → Hardcoded fallback<br/>
- lib/auth.js — bug corrigido: decoded.id → decoded.sub<br/>
- docker.yml — filtro de container alterado: name → ancestor (imagem GHCR)

#### Backend — Rotas Admin (routes/admin.js)
- GET /admin/config — lista todas as configurações (secretos mascarados)
- GET /admin/config/:category — lista configs de uma categoria<br/>
- PUT /admin/config/:category/:key — atualiza + audit log
- POST /admin/config — cria + audit log
- DELETE /admin/config/:category/:key — remove + audit log
- POST /admin/config/reload — invalida cache
- Todas protegidas com fastify.authorize('superadmin')

#### Frontend — SuperAdminConfig.jsx
- src/api/admin.js — 5 funções de API
- src/pages/super-admin/SuperAdminConfig.jsx — CRUD completo
- 4 abas (Storage, Database, Geral, Email)
- Criação, edição inline, exclusão com confirmação
- Campos secretos mascarados com toggle
- Botão Recarregar Cache e botão Auditoria
- Link Voltar ao Dashboard e guard de segurança
- Rota /super-admin/configuracoes no App.jsx

#### Auditoria
- Toda alteração registra em audit_logs: user_id, action, entity_id, old_value, new_value, ip_address

#### Usuário Super Admin
- superadmim@wrtec.com.br — role superadmin
- admin@portonovo.com — role admin (sem acesso ao Super Admin)

### Sprint 7 — Tela de Auditoria
#### Backend
- GET /admin/audit — listagem de logs com paginação, filtros por action e entity_id

#### Frontend — SuperAdminAudit.jsx
- src/pages/super-admin/SuperAdminAudit.jsx — tela completa
- Tabela: Data/Hora, Ação (badge colorido), Entidade, Valor Antigo, Valor Novo, IP
- Filtros por ação (select) e entidade (texto)
- Paginação
- Link Voltar ao Super Admin e guard de segurança
- Rota /super-admin/auditoria no App.jsx

### Funcionalidades Base (Sprints Anteriores)
- Autenticação JWT com multi-tenant
- CRUD completo de produtos, filiais, categorias
- Tela de importação CSV com abas (Ofertas, Filiais, Categorias)
- Dashboard com métricas, gráficos e navegação
- Modal de edição de produtos
- Upload de imagens para MinIO S3
- Correção de CORS (PUT, DELETE, PATCH, OPTIONS)
- Pipeline CI/CD do frontend e da API
- Portainer Enterprise, ghcr.io, Docker Swarm + Traefik + Let's Encrypt

---

## Em Andamento

### Sprint 8 — Site Público do Cliente (app-ofertas)

Decisão arquitetural: **Novo repositório separado** (app-ofertas) para evitar conflito de rotas SPA e isolar CI/CD.

#### Arquitetura
- Single SPA multi-tenant com CNAME por cliente
- 1 único deploy atende todos os clientes
- Identificação do tenant por domínio (window.location.hostname)
- Branding dinâmico via CSS variables
- Consumo de dados via endpoints públicos da API (sem autenticação)

#### Backend
- GET /api/public/tenant — dados do tenant (branding)
- GET /api/public/offers — ofertas ativas
- GET /api/public/products — produtos
- GET /api/public/stores — lojas
- GET /api/public/categories — categorias

#### Frontend
- Novo repositório: https://github.com/Wittemberg/app-ofertas<br/>
- Stack: React + Vite + TailwindCSS (mesmo do admin)<br/>
- Rotas: /, /ofertas, /produtos, /lojas, /produto/:slug, /loja/:slug<br/>
- Componentes: BrandingProvider, Header, OfferCard, Footer

#### Infraestrutura
- Imagem: ghcr.io/wittemberg/app-ofertas:latest<br/>
- Stack Portainer: app-ofertas<br/>
- Domínio: app-ofertas.wrtec.com.br
- CI/CD independente do admin
- CNAME dos clientes apontando para portainer.wrtec.com.br
- Onboarding sem rebuild: apenas criar CNAME + configurar tenant no banco

---

## Proximas Fases

### Fase 9 — Notificação de Alteração
Backend identifica configs críticas (storage.*) e dispara notificação por email/webhook. Esforço: 3h

### Fase 10 — Validação Extra (Confirmação de Senha)
Backend: POST /admin/config/verify-password com token temporário de 5min. Frontend: modal de senha. Esforço total: 4h

---

## Roadmap de Funcionalidades

### Proximas Features
#### 10 — Site público do cliente
Complexidade: Alta. Em andamento (Sprint 8).
Portal público onde o consumidor final navega por ofertas, lojas e categorias. Novo repositório app-ofertas.

---

## Roadmap de IA


### Detalhamento — Roadmap de IA
#### 1 — Extração de paleta de cores a partir da logo
IA analisa a logo e extrai cores dominantes para pré-preencher paleta.

#### 3 — Sugestão de categoria por IA
Sugestão automática baseada no nome do produto.

#### 4 — Geração de descrição de produto
Descrição automática baseada em nome, categoria e código de barras.

#### 6 — Ofertas inteligentes
Sugestão de preço promocional baseado em histórico e margem.

---

> Ultima atualização: 19/05/2026