
---

## 📄 roadmap.md
```markdown
# Roadmap — Admin Ofertas

> Documento central do projeto. Mantido pela IA da Adapta ONE para contexto entre sessões.

---

## ✅ Status Atual — Concluído

### Sprint 3 — Dashboard com Métricas e Gráficos
- 4 cards métricos (Produtos, Lojas, Categorias, Ofertas)
- Totalizador de ofertas em destaque
- Gráfico de barras "Ofertas por Loja"
- Gráfico de barras "Produtos por Categoria"
- Navegação rápida com links para todas as páginas
- Link "Importar CSV" incluso no dashboard
- Dashboard.jsx reescrito com cards clicáveis (links)

### Sprint 4 — Exportação de Relatórios
- Endpoint `GET /reports/active-offers` — ofertas vigentes
- Endpoint `GET /reports/without-offers` — produtos sem oferta ativa
- Endpoint `GET /reports/inactive-stores` — filiais inativas
- Página `/relatorios` com 3 cards de download CSV
- Exportação CSV nativa (sem dependências, abre no Excel)
- Rota no App.jsx + link no Dashboard

### Sprint 5 — API de Integração com ERPs
- Schema: tabelas `api_keys` e `integration_logs` no PostgreSQL
- Middleware `authenticateApiKey` em `lib/auth.js` (header `X-API-Key`)
- Endpoint único `POST /api/v1/integration/import`
  - Importação em lote de stores, categories, products e offers
  - Upsert por slug (stores/categories) e internal_code/barcode (products)
  - Resolução automática de produto por código na oferta
  - Validação individual por registro (erros não bloqueiam o lote)
  - Relatório detalhado de created/updated/errors/warnings
- Idempotência via `idempotency_key`
- Endpoint `GET /api/v1/integration/status/:idempotency_key`
- Geração de API Key via `POST /auth/api-keys` (mostrada 1 vez)
- Listagem e revogação de chaves
- Página `/api-keys` no frontend com gerenciamento completo
- Cópia automática da chave para área de transferência ao clicar
- Rate limit: 10 requisições/minuto por chave
- Tabela `integration_logs` registra toda requisição (IP, status, sumário)

### Sprint 6 — Super Admin System
#### Infraestrutura e Segurança
- Tabela `system_configs` no PostgreSQL (criada manualmente)
- Tabela `audit_logs` no PostgreSQL (criada manualmente)
- Models `system_configs` e `audit_logs` no `prisma/schema.prisma`
- `lib/config.js` — cache + CRUD (getAllConfigs, setConfig, deleteConfig, invalidateCache)
- Chain de resolução: Banco → Env vars → Hardcoded fallback
- `lib/auth.js` — bug corrigido: `decoded.id` → `decoded.sub`
- `docker.yml` — filtro de container alterado: `name` → `ancestor` (imagem GHCR)

#### Backend — Rotas Admin (`routes/admin.js`)
- `GET /admin/config` — lista todas as configurações (secretos mascarados)
- `GET /admin/config/:category` — lista configs de uma categoria
- `PUT /admin/config/:category/:key` — atualiza + audit log
- `POST /admin/config` — cria + audit log
- `DELETE /admin/config/:category/:key` — remove + audit log
- `POST /admin/config/reload` — invalida cache
- Todas protegidas com `fastify.authorize('superadmin')`

#### Frontend — SuperAdminConfig
- `src/api/admin.js` — 5 funções de API
- `src/pages/super-admin/SuperAdminConfig.jsx` — CRUD completo com:
  - 4 abas (Storage, Database, Geral, Email)
  - Criação, edição inline, exclusão com confirmação
  - Campos secretos mascarados com toggle
  - Botão "Recarregar Cache" e botão "📋 Auditoria"
  - Link "← Voltar ao Dashboard"
  - Guard de segurança com tela de bloqueio + link de voltar
- Rota `/super-admin/configuracoes` no App.jsx

#### Auditoria
- Toda alteração registra em `audit_logs`: user_id, action, entity_id, old_value, new_value, ip_address

#### Usuário Super Admin
- `superadmim@wrtec.com.br` — role `superadmin`
- `admin@portonovo.com` — role `admin` (sem acesso ao Super Admin)

### Sprint 7 — Tela de Auditoria
#### Backend
- `GET /admin/audit` — listagem de logs com paginação, filtros por action e entity_id

#### Frontend — SuperAdminAudit
- `src/pages/super-admin/SuperAdminAudit.jsx` — tela completa:
  - Tabela: Data/Hora, Ação (badge colorido), Entidade, Valor Antigo, Valor Novo, IP
  - Filtros por ação (select) e entidade (texto)
  - Paginação
  - Link "← Voltar ao Super Admin"
  - Guard de segurança com tela de bloqueio + link "← Voltar ao Dashboard"
- Rota `/super-admin/auditoria` no App.jsx

### Funcionalidades Base (Sprints Anteriores)
- Autenticação JWT com multi-tenant
- CRUD completo de produtos, filiais, categorias
- Importação CSV com abas (Ofertas/Filiais/Categorias)
- Dashboard com métricas, gráficos, navegação
- Modal de edição de produtos
- CORS (PUT, DELETE, PATCH, OPTIONS)
- Pipeline CI/CD do frontend e da API
- Portainer Enterprise, ghcr.io, Docker Swarm + Traefik + Let's Encrypt

---

## 🎯 Próximas Fases

### Fase 8 — Notificação de Alteração
| Item | Detalhes | Esforço |
|---|---|---|
| **Backend** | Identificar configs críticas (storage.*) e disparar notificação por email/webhook | ~3h |

**Critério:** configs com `category = 'storage'` e key `endpoint`, `access_key`, `secret_key`, `bucket` disparam notificação.

### Fase 9 — Validação Extra (Confirmação de Senha)
| Item | Detalhes | Esforço |
|---|---|---|
| **Backend** | `POST /admin/config/verify-password` — valida senha, gera token temporário de 5min | ~1h |
| **Frontend** | Modal solicitando senha do superadmin antes de alterar configs secretas | ~3h |
| **Total** | | ~4h |

---

## 🗺️ Roadmap de Funcionalidades

### Próximas Features
#### 10 — Site público do cliente
**Complexidade:** Alta
Portal público onde o consumidor final navega por ofertas, lojas e categorias. Consumirá os dados configurados nas Configurações da Empresa.

---

## 🤖 Roadmap de IA

| # | Item | Prioridade | Impacto | Status |
|---|---|---|---|---|
| 1 | Extração de paleta de cores a partir da logo | Média | Alto | Pendente |
| 2 | Busca automática de imagens (nome + código de barras) | Média | Alto | Pendente |
| 3 | Sugestão de categoria por IA | Baixa | Médio | Pendente |
| 4 | Geração de descrição de produto | Baixa | Médio | Pendente |
| 5 | Enriquecimento por código de barras (consulta API pública EAN) | Média | Alto | Pendente |
| 6 | Ofertas inteligentes (preços baseados em histórico) | Alta | Muito Alto | Pendente |

### Detalhamento
#### 1 — Extração de paleta de cores a partir da logo
IA analisa a logo e extrai cores dominantes para pré-preencher paleta (primary, secondary, accent, background, text).

#### 3 — Sugestão de categoria por IA
Sugestão automática baseada no nome do produto.

#### 5 — Enriquecimento por código de barras
Consulta APIs públicas pelo EAN (marca, fabricante, imagem).

---

> Última atualização: 19/05/2026