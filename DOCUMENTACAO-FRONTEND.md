# admin-ofertas-front - Documentacao Tecnica

Frontend SPA do painel administrativo do projeto Ofertas. O sistema e multi-tenant e consome a API do repositorio `api-ofertas`, enquanto o site publico do cliente final fica no repositorio `app-ofertas`.

## Visao Geral

O painel permite administrar:

- Produtos, filiais, categorias e ofertas
- Importacao CSV de dados em lote
- Dashboard com metricas operacionais
- Mesa de atendimento de pedidos em tempo quase real
- Historico e auditoria de status dos pedidos
- Cadastro de usuarios do tenant com perfis basicos
- Relatorios em CSV
- Chaves de API para integracoes externas
- Configuracoes da empresa exibidas no painel e no site publico
- Branding da loja, incluindo logo, paleta de cores e fonte
- Troca de senha pelo usuario logado
- Recuperacao de senha por e-mail
- Area de Super Admin para configuracoes globais, clientes e auditoria

## Stack

| Tecnologia | Uso |
| --- | --- |
| React 19 | Interface SPA |
| Vite 8 | Build e ambiente de desenvolvimento |
| React Router DOM 7 | Rotas publicas e privadas |
| TailwindCSS 4 | Estilizacao |
| Axios | Cliente HTTP com interceptors |
| Nginx | Servir build estatico em producao |

## Design System e Auditoria Visual

- Guia visual: `design-system/MASTER.md`
- Checklist de revisao: `design-system/AUDITORIA-VISUAL.md`

Esses arquivos devem orientar novas telas, revisoes de UI e recursos visuais gerados por IA. O painel deve manter linguagem operacional, com densidade adequada, estados claros e permissao por perfil respeitada.

## Planejamento de Sprints

- Contexto do projeto: `planning/PROJECT.md`
- Estado atual: `planning/STATE.md`
- Template de sprint: `planning/SPRINT-TEMPLATE.md`
- Sprints registradas: `planning/sprints/`

Esse fluxo substitui a necessidade de instalar ferramentas externas de planejamento. Cada sprint relevante deve registrar objetivo, escopo, decisoes, criterios de aceite e validacoes.

## Rotas Publicas

### Login - `/login`

Arquivo: `src/pages/Login.jsx`

Tela de autenticacao. Envia credenciais para `POST /auth/login`, armazena o token JWT no `localStorage` e direciona o usuario para o dashboard. Tambem possui link para recuperacao de senha.

### Esqueci minha senha - `/esqueci-senha`

Arquivo: `src/pages/ForgotPassword.jsx`

Solicita o e-mail do usuario e chama `POST /auth/forgot-password`. A API usa as configuracoes SMTP cadastradas no Super Admin para enviar o link de redefinicao.

### Redefinir senha - `/redefinir-senha`

Arquivo: `src/pages/ResetPassword.jsx`

Recebe o token pela query string (`?token=...`) e envia a nova senha para `POST /auth/reset-password`.

## Rotas Autenticadas

Todas as rotas autenticadas passam pelo `ProtectedRoute`, que exige token valido e redireciona para `/login` em caso de sessao ausente ou expirada.

### Dashboard - `/`

Arquivo: `src/pages/Dashboard.jsx`

Exibe cards com totais de produtos, lojas, categorias e ofertas ativas, alem de graficos simples de ofertas por loja e produtos por categoria. Usuarios com perfil `superadmin` veem um link para acessar a area de Super Admin. A tela tambem possui acesso para troca de senha.

O bloco de pedidos exibe:

- carrinhos ativos agora;
- carrinhos abandonados hoje;
- pedidos hoje;
- conversao hoje;
- pedidos pendentes agora;
- pedidos em atendimento agora;
- pedidos concluidos hoje;
- pedidos cancelados hoje;
- ultimos pedidos;
- produtos mais pedidos no dia.

### Trocar senha - `/alterar-senha`

Arquivo: `src/pages/ChangePassword.jsx`

Permite que o usuario logado altere a propria senha informando a senha atual e a nova senha. Chama `POST /auth/change-password`.

### Produtos - `/produtos`

Arquivo: `src/pages/Products.jsx`

CRUD de produtos com busca, paginacao, categoria, codigos internos, EAN, unidade, descricao e imagem.

### IA Produtos - `/produtos/ia`

Arquivo: `src/pages/ProductEnrichment.jsx`

Tela de enriquecimento visual de produtos. Permite:

- buscar produtos por nome, codigo interno ou barcode;
- solicitar sugestao automatica por barcode;
- buscar ate 3 imagens ranqueadas na web usando sites cadastrados, Tavily e/ou SerpAPI;
- cadastrar sugestao manual por URL de imagem;
- revisar sugestoes com fonte, confianca e status;
- ajustar URL/observacao antes de aprovar;
- aprovar imagem e aplicar no produto;
- recusar sugestoes inadequadas.

Regras:

- A tela e acessivel por `admin` e `editor`.
- Nenhuma imagem e aplicada automaticamente sem aprovacao.
- Sites de scraping e chaves Tavily/SerpAPI ficam no Super Admin, categoria `ai`.
- Tokens de API devem ser marcados como segredo.
- Imagem real tem prioridade sobre imagem gerada.

### Filiais - `/filiais`

Arquivo: `src/pages/Stores.jsx`

CRUD de filiais com nome, slug, cidade, estado, telefone e status.

### Categorias - `/categorias`

Arquivo: `src/pages/Categories.jsx`

CRUD de categorias com nome, slug e status.

### Ofertas - `/ofertas`

Arquivo: `src/pages/Offers.jsx`

Gestao de ofertas com filtros por produto, filial e destaque.

### Pedidos - `/pedidos`

Arquivo: `src/pages/Orders.jsx`

Gestao completa dos pedidos recebidos pelo site publico. A tela possui:

- filtros por busca, periodo e status;
- contadores por status;
- atualizacao automatica a cada 30 segundos;
- alerta visual e sonoro para pedido novo;
- detalhe do pedido com itens, total, loja, origem, e-mail e WhatsApp;
- alteracao de status;
- link para abrir WhatsApp;
- copia de resumo do pedido;
- historico de status com origem, usuario e horario.

Status usados:

| Status | Descricao |
| --- | --- |
| `pending` | Pendente |
| `processing` | Em atendimento |
| `completed` | Concluido |
| `cancelled` | Cancelado |

### Atendimento - `/atendimento`

Arquivo: `src/pages/OrderDesk.jsx`

Mesa operacional para deixar aberta no cliente durante o atendimento. Mostra duas colunas:

- novos pedidos;
- pedidos em atendimento.

Funcionalidades:

- atualizacao automatica a cada 15 segundos;
- alerta sonoro para pedido novo;
- iniciar atendimento;
- concluir pedido;
- cancelar pedido;
- copiar resumo;
- abrir WhatsApp do pedido.

### Importar CSV - `/importar`

Arquivo: `src/pages/ImportCSV.jsx`

Importacao em lote para ofertas, filiais e categorias, com validacoes e feedback visual.

### Relatorios - `/relatorios`

Arquivo: `src/pages/Reports.jsx`

Downloads em CSV para operacoes administrativas, como ofertas vigentes, produtos sem oferta e lojas inativas.

Tambem cobre o ciclo de pedidos para operacoes sem API:

- pedidos do site;
- itens dos pedidos;
- historico de status;
- carrinhos e abandonos;
- resumo de pedidos.

Os relatorios de pedidos aceitam filtros por periodo e status.

### API Keys - `/api-keys`

Arquivo: `src/pages/ApiKeys.jsx`

Criacao, listagem, copia e revogacao de chaves de API para integracoes externas.

### Usuarios - `/usuarios`

Arquivo: `src/pages/Users.jsx`

Tela para administradores do tenant criarem e manterem apenas usuarios da propria empresa.

Perfis:

| Perfil | Acesso principal |
| --- | --- |
| `admin` | Acesso total ao tenant |
| `editor` | Produtos, filiais, categorias, ofertas e importacao |
| `operator` | Pedidos e atendimento |
| `viewer` | Dashboard e relatorios |

Regras de interface:

- Somente `admin` de tenant acessa `/usuarios`.
- `superadmin` nao herda acesso automatico as telas de tenant; ele usa a area `/super-admin`.
- A listagem de `/usuarios` e filtrada no backend pelo `tenant_id` do usuario logado.
- O usuario logado nao consegue desativar a si mesmo.
- O usuario logado nao consegue alterar o proprio perfil.
- Atalhos do dashboard aparecem conforme o perfil.

### Configuracoes da empresa - `/configuracoes`

Arquivo: `src/pages/TenantSettings.jsx`

Centraliza dados usados pelo painel e pelo site publico:

- Nome, descricao e dominio
- Telefone, e-mail e WhatsApp
- Endereco
- Redes sociais
- Horarios de funcionamento
- Fonte visual
- Logo e paleta de cores

## Branding Inteligente

Arquivo: `src/pages/BrandingUpload.jsx`

Componente usado dentro das configuracoes da empresa para upload e preview da logo. Aceita imagens PNG, JPG, SVG e WebP, com limite de 2 MB.

Fluxo principal:

- Faz upload da logo em `POST /auth/tenant/logo`
- Gera paleta de cores em `POST /auth/tenant/branding`
- Salva cores e logo em `PUT /auth/tenant/settings`
- Mantem cache-bust apenas no preview local, preservando a URL limpa para persistencia

Esse cuidado evita que a logo salva fique com query string temporaria e previne quebra de preview quando a imagem vem de S3/MinIO.

## Super Admin

A area de Super Admin possui guard interno alem do `ProtectedRoute`. Apenas usuarios com `role === "superadmin"` acessam essas telas.

### Configuracoes globais - `/super-admin/configuracoes`

Arquivo: `src/pages/super-admin/SuperAdminConfig.jsx`

Permite consultar e editar configuracoes globais do sistema por categoria:

- `storage`: S3/MinIO e URLs publicas de arquivos
- `database`: configuracoes relacionadas ao banco
- `general`: parametros gerais da aplicacao
- `email`: configuracoes SMTP

Tambem possui acao para recarregar cache de configuracoes e acesso rapido para Clientes e Auditoria.

#### Configuracoes SMTP esperadas

Categoria: `email`

| Chave | Exemplo | Observacao |
| --- | --- | --- |
| `host` | `smtppro.zoho.com` | Servidor SMTP |
| `port` | `465` | Normalmente `465` com SSL ou `587` com STARTTLS |
| `user` | `financeiro@wrtec.com.br` | Conta autenticada no provedor |
| `password` | `********` | Senha ou app password, marcada como secreta |
| `from` | `Admin Ofertas <financeiro@wrtec.com.br>` | Remetente autorizado pelo provedor |
| `secure` | `true` | Use `true` para porta 465 e `false` para 587 |
| `reset_url` | `https://admin-ofertas.wrtec.com.br` | Base usada para montar o link de redefinicao |

### Clientes - `/super-admin/clientes`

Arquivo: `src/pages/super-admin/SuperAdminClients.jsx`

Tela para gerenciar tenants/clientes. Permite:

- Listar clientes existentes
- Criar novo cliente
- Definir nome, slug, dominio e status
- Criar ou atualizar o usuario administrador do cliente
- Alterar e-mail e nome do administrador
- Redefinir senha inicial ou temporaria do administrador
- Ativar ou desativar cliente

Principais endpoints usados:

- `GET /admin/tenants`
- `POST /admin/tenants`
- `PUT /admin/tenants/:id`

### Auditoria - `/super-admin/auditoria`

Arquivo: `src/pages/super-admin/SuperAdminAudit.jsx`

Exibe logs administrativos com data, acao, entidade, valores antigos/novos e IP. Usada para rastrear alteracoes sensiveis feitas no Super Admin.

## Modulos de API

### `src/api/axios.js`

Instancia central do Axios. Define `baseURL` por variavel de ambiente, injeta token JWT no header `Authorization` e trata respostas `401` removendo a sessao local.

### `src/api/auth.js`

Funcoes principais:

- `login(email, password)`
- `getMe()`
- `changePassword(current_password, new_password)`
- `forgotPassword(email)`
- `resetPassword(token, new_password)`

### `src/api/admin.js`

Funcoes de Super Admin:

- `getConfigs()`
- `getConfigsByCategory(category)`
- `createConfig(data)`
- `updateConfig(category, key, data)`
- `deleteConfig(category, key)`
- `reloadCache()`
- `getAuditLogs(params)`
- `getTenants()`
- `createTenant(data)`
- `updateTenant(id, data)`

### `src/api/tenant.js`

Configuracoes da empresa:

- `getTenantSettings()`
- `updateTenantSettings(data)`
- `uploadTenantLogo(file)`
- `uploadTenantBranding(file)`

## Integracao com o Site Publico

O site publico fica no repositorio `app-ofertas` e consome dados publicos da API, incluindo configuracoes visuais cadastradas no admin:

- Logo
- Cores
- Fonte
- Nome e descricao da loja
- Contatos
- Endereco
- Redes sociais
- Horarios
- Produtos, ofertas, categorias e filiais
- Configuracoes de pedidos/lista
- WhatsApp/e-mail de recebimento de pedidos
- Tempo configuravel para carrinho abandonado

## Deploy

O projeto e empacotado em Docker com build multi-stage:

1. Builder Node para gerar os arquivos estaticos
2. Nginx para servir a SPA em producao

O deploy atual roda via GitHub Actions, publica a imagem no registry configurado e aciona redeploy no Portainer/Swarm.

## Operacao

Checklist pratico para cadastro de cliente, SMTP, S3/MinIO, pedidos, testes e diagnostico:

```text
CHECKLIST-OPERACIONAL.md
```

## URL de Producao

`https://admin-ofertas.wrtec.com.br`

---

Atualizado em 27/05/2026.
