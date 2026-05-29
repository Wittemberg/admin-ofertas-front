# Roadmap - Admin Ofertas

Atualizado em 27/05/2026.

Este e o roadmap central do projeto Ofertas. Ele consolida o que antes estava dividido entre `admin-ofertas-front/Roadmap-Admin-Ofertas.md` e `api-ofertas/roadmap.md`.

Repositorios relacionados:

- `admin-ofertas-front`: painel administrativo e Super Admin
- `api-ofertas`: API, banco, integracoes, tenant settings e arquivos
- `app-ofertas`: site publico de ofertas consumido pelos clientes finais

## Status Geral

O projeto ja possui base funcional em producao, com deploy automatizado via GitHub Actions, Portainer, Docker Swarm e Traefik. O ciclo principal do Admin Ofertas esta operacional: cadastro/manutencao de clientes, recuperacao de senha, branding/logo e configuracoes essenciais ja foram validados em producao.

## Concluido

### Infraestrutura e deploy

- Deploy com Docker Swarm.
- Reverse proxy com Traefik e HTTPS via Let's Encrypt.
- Portainer configurado para redeploy das stacks.
- Pipelines GitHub Actions acionando build e deploy.
- Imagens publicadas no registry configurado.
- Deploys atuais do admin e da API funcionando.

### Base multi-tenant

- Modelo `tenants` com isolamento de dados.
- Usuarios vinculados a tenant.
- Login com fallback por e-mail quando o admin acessa pela URL da API.
- Resolucao de tenant por dominio, host ou JWT.
- Bloqueio de login para tenant inativo.

### Autenticacao e seguranca

- Login JWT no painel.
- `ProtectedRoute` no frontend.
- Guards de permissao por papel (`admin` e `superadmin`) na API.
- Area de Super Admin protegida por `role === "superadmin"`.
- Troca de senha para usuario logado.
- Recuperacao de senha por e-mail com token temporario.
- Recuperacao de senha por e-mail validada, operacional e testada.
- Usuario inativo bloqueado no login.
- Configuracoes SMTP centralizadas no Super Admin.
- API Keys para integracoes externas.

### Painel administrativo

- Dashboard com indicadores de produtos, lojas, categorias e ofertas.
- Dashboard com indicadores de pedidos, carrinhos, conversao e atendimento.
- Graficos simples de ofertas por loja e produtos por categoria.
- CRUD de produtos.
- CRUD de filiais.
- CRUD de categorias.
- CRUD visual de ofertas.
- Importacao CSV de ofertas.
- Importacao CSV de filiais.
- Importacao CSV de categorias.
- Relatorios CSV.
- Relatorios CSV filtrados por periodo/status para pedidos, itens, historico, carrinhos e resumo.
- Tela de pedidos com filtros, contadores, auto-refresh, som de novo pedido e detalhe completo.
- Mesa de atendimento em `/atendimento` para pedidos pendentes e em atendimento.
- Gestao de API Keys.
- Tela de configuracoes da empresa.
- Link para Super Admin visivel apenas para superadmin.
- Link de troca de senha no dashboard.
- Navegacao de retorno padronizada nas telas principais.
- Cadastro e manutencao de usuarios do tenant, filtrados por empresa.
- Perfis basicos por usuario: admin, editor, operator e viewer.
- Atalhos do dashboard filtrados por perfil.
- Super Admin separado das telas operacionais do tenant.
- Design system e checklist de auditoria visual versionados.
- Harmonizacao visual inicial dos CRUDs antigos: produtos, ofertas, filiais, categorias, API Keys, relatorios, pedidos e atendimento.
- Remocao de `alert()`/`confirm()` nativos das paginas do painel em favor de mensagens inline e confirmacao visual padronizada.
- Planejamento enxuto de sprints versionado em `planning/`, inspirado no fluxo GSD, sem dependencia externa.

### Configuracoes da empresa

- Edicao de nome, descricao e dominio.
- Edicao de dados de contato.
- Edicao de endereco.
- Edicao de redes sociais.
- Edicao de horarios de funcionamento.
- Edicao de fonte visual.
- Upload de logo.
- Geracao de paleta com base na logo.
- Preview visual no painel.
- Correcoes de URL da logo para evitar duplicacao de bucket no S3/MinIO.
- Persistencia da URL limpa da logo, sem parametros temporarios de cache.
- Branding e logo validados em producao.

### Super Admin

- Tela de configuracoes globais.
- Categorias de configuracao: `storage`, `database`, `general` e `email`.
- Campos secretos mascarados.
- Recarregamento de cache de configuracoes.
- Tela de auditoria.
- Tela de clientes.
- Cadastro de novo cliente/tenant.
- Criacao de usuario admin inicial do cliente.
- Edicao de cliente existente.
- Edicao do admin principal.
- Redefinicao de senha do admin principal.
- Ativacao e desativacao de cliente.
- Cadastro e manutencao de clientes validados em producao.

### API

- Rotas autenticadas para produtos, filiais, categorias e ofertas.
- Rotas de dashboard.
- Rotas de relatorios.
- Rotas de importacao CSV.
- Rotas de tenant settings.
- Rotas de upload de logo.
- Rota de branding com extracao de paleta.
- Rotas publicas para o `app-ofertas`.
- Rotas de Super Admin para configs, clientes e auditoria.
- Rotas de API Key.
- Rotas de integracao externa via `/api/v1/integration`.
- Logs de integracao com idempotencia.
- Auditoria para alteracoes sensiveis.
- Rotas administrativas de pedidos.
- Historico/auditoria de status de pedidos.
- Relatorios de pedidos, itens, carrinhos, resumo e historico de status.

### Site publico

- Consumo de tenant publico por dominio.
- Consumo de ofertas publicas.
- Consumo de produtos publicos.
- Consumo de filiais publicas.
- Consumo de categorias publicas.
- Aplicacao de branding vindo do tenant: logo, cores, fonte, contatos e dados da empresa.
- Carrinho/lista de ofertas.
- Captura antecipada de nome e WhatsApp.
- Registro de carrinho ativo/abandonado.
- Finalizacao de pedido com envio por e-mail e WhatsApp.

### Modulo de pedidos

- Habilitacao por tenant via `orders_enabled`.
- Configuracao de e-mail e WhatsApp de recebimento do pedido.
- Tempo de carrinho abandonado configuravel por tenant.
- Pedido salvo com snapshot de itens.
- Historico inicial criado quando o pedido nasce no site publico.
- Mudancas de status registradas com usuario, origem e data.
- Tela `/pedidos` validada.
- Tela `/atendimento` validada, incluindo alerta sonoro de pedido novo.
- Exportacao CSV de pedidos, itens, carrinhos, resumo e historico de status.
- Dashboard com metricas de pedidos e atendimento.

### Documentacao

- `DOCUMENTACAO-FRONTEND.md` atualizado.
- `DOCUMENTACAO-API.md` atualizado.
- `DOCUMENTACAO-INTEGRACAO.md` atualizado.
- `DOCUMENTACAO-APP-OFERTAS.md` atualizado.
- `CHECKLIST-OPERACIONAL.md` criado.
- Roadmap consolidado neste arquivo.
- Roadmap duplicado da API removido.

## Validado em Producao

### Recuperacao de senha por e-mail

Validado, operacional e funcional. Fluxo testado com envio de e-mail, link de redefinicao e troca de senha por token.

### Cadastro e manutencao de clientes

Validado. Fluxo de criacao, edicao e manutencao de clientes esta em ordem.

### Branding e logo

Validado. Upload de logo, preview, persistencia e aplicacao do branding estao funcionando.

### Fluxo de pedidos

Validado. Carrinho/lista, pedido salvo, envio por e-mail, link de WhatsApp, tela de pedidos, mesa de atendimento, alerta sonoro, relatorios filtrados e historico de status estao operacionais.

## Pendente Prioritario

### 1. Refinar UX do Super Admin

Prioridade: Alta.

Objetivo: deixar a area de Super Admin mais organizada, previsivel e facil de operar.

Pendencias:

- Melhorar organizacao visual entre Configuracoes, Clientes e Auditoria.
- Separar melhor acoes perigosas, como desativar cliente.
- Exibir estados vazios, carregamento e erro de forma mais clara.
- Confirmar se a tela de clientes esta agradavel apos uso real.

### 2. Testes manuais de ponta a ponta

Prioridade: Alta.

Fluxos a testar:

- Login admin.
- Login superadmin.
- Troca de senha logada.
- Esqueci minha senha.
- Criacao de cliente.
- Edicao/desativacao de cliente.
- Upload de logo.
- Geracao de paleta.
- CRUD completo de produtos, filiais, categorias e ofertas.
- Importacao CSV.
- Site publico consumindo dados do tenant.
- Fluxo completo de pedido: carrinho, finalizacao, e-mail, WhatsApp, atendimento, conclusao e relatorio.

### 3. Melhorar mensagens de erro

Prioridade: Alta.

Pendencias:

- Evitar mensagens genericas como `Internal Server Error`.
- Padronizar formato de erros da API.
- Exibir mensagens amigaveis no frontend.
- Registrar detalhes tecnicos apenas no log da API.

### 4. Validar dados obrigatorios por tela

Prioridade: Media.

Pendencias:

- Revisar validacoes de cliente/tenant.
- Revisar validacoes de produto.
- Revisar validacoes de oferta.
- Revisar validacoes de configuracoes SMTP.
- Revisar validacoes de storage.

### 5. Melhorar documentacao operacional

Prioridade: Media.

Concluido:

- Checklist operacional para cadastro de cliente, SMTP, S3/MinIO, pedidos, testes e diagnostico.

Pendencias:

- Criar checklist especifico de deploy.
- Documentar comandos de diagnostico no Portainer/API.

## Pendente Tecnico

### Testes automatizados

Ainda faltam testes automatizados para reduzir risco em mudancas futuras.

Sugestoes:

- Testes unitarios para helpers de URL de storage/logo.
- Testes unitarios para resolucao de configs.
- Testes de rotas de auth.
- Testes de rotas de tenant settings.
- Testes de rotas de Super Admin.
- Testes de fluxo de recuperacao de senha com SMTP mockado.

### Migrations e schema

Pontos a revisar:

- Garantir que campos recentes de `tenants` existem em producao.
- Garantir que `system_configs` e `audit_logs` estejam consistentes.
- Conferir se alteracoes de schema tem migration versionada quando necessario.

### Observabilidade

Pendencias:

- Padronizar logs de erro.
- Ter rastreio simples para falhas de SMTP.
- Ter rastreio simples para falhas de S3/MinIO.
- Adicionar healthcheck mais util que apenas `/`.
- Monitorar falhas de envio de e-mail de pedido.

### Performance e escalabilidade

Pendencias:

- Revisar paginacao de produtos e ofertas em bases maiores.
- Revisar indices do banco para buscas frequentes.
- Revisar limite de importacao CSV.
- Revisar timeout para uploads e imports.

## Roadmap de IA

### 1. Busca automatica de imagens de produto

Prioridade: Em andamento. Impacto: Alto.

Objetivo: reduzir trabalho manual no cadastro visual do catalogo.

Escopo previsto:

- Usar o ERP/importacao como fonte principal de codigo de barras, nome e marca.
- Buscar imagem por nome, EAN e marca, nao apenas pelo codigo de barras isolado.
- Evitar imagens genericas ou erradas.
- Sugerir imagem ao usuario antes de salvar.
- Endpoint implementado: `POST /products/:id/enrichment/web-search`.
- Interface de preview no frontend para aceitar ou recusar.
- Salvar fonte, nivel de confianca e status de aprovacao da imagem encontrada.
- Quando a confianca for baixa, enviar para uma fila de revisao manual.
- Se nao houver imagem real confiavel, usar placeholder por categoria ou imagem gerada marcada como nao-real.

Entregue na primeira etapa:

- Modelo de enriquecimento `product_enrichments`.
- Tela `/produtos/ia` para criar e revisar sugestoes.
- Aprovar sugestao aplica `image_url` no produto.
- Recusar sugestao mantem produto sem alteracao.
- Busca web configuravel por Super Admin, categoria `ai`.
- Suporte a Tavily e SerpAPI como provedores de busca.
- Top 3 imagens ranqueadas entram na fila de revisao para aprovacao manual.

Decisao importante:

- Open Food Facts e Open Products Facts podem ser usados como fontes auxiliares, mas nao devem ser a base principal porque possuem cobertura limitada para produtos brasileiros.
- O sistema deve construir uma base propria de enriquecimento por barcode, reaproveitando imagens e metadados aprovados entre tenants quando fizer sentido.
- A base propria deve armazenar pelo menos: barcode, nome, marca, categoria sugerida, image_url, fonte, confianca, aprovado_em e status.
- Tokens de provedores externos devem ficar em `system_configs` como segredo, nunca no codigo.

### 2. Sugestao de categoria

Prioridade: Baixa. Impacto: Medio.

Objetivo: sugerir categoria automaticamente a partir do nome do produto, descricao e historico do tenant.

### 3. Geracao de descricao de produto

Prioridade: Baixa. Impacto: Medio.

Objetivo: gerar descricoes comerciais para produtos usando nome, unidade, categoria e marca.

### 4. Enriquecimento por codigo de barras

Prioridade: Media. Impacto: Alto.

Objetivo: consultar bases externas por EAN para preencher nome oficial, marca, fabricante e imagem.

Estrategia prevista:

- Tentar bases abertas primeiro quando aplicavel: Open Food Facts para alimentos e Open Products Facts para nao-alimentos.
- Complementar com busca web/IA usando `barcode + nome + marca`.
- Avaliar APIs comerciais de barcode/GTIN para melhor cobertura nacional, se necessario.
- Permitir enriquecimento manual pelo admin quando a automacao nao encontrar resultado confiavel.

### 5. Ofertas inteligentes

Prioridade: Futura. Impacto: Muito alto.

Objetivo: sugerir ofertas com base em historico de vendas, margem, sazonalidade e comportamento de consumo.

### 6. Criacao automatica de banners

Prioridade: Media. Impacto: Alto.

Objetivo: gerar banners promocionais com base nas ofertas ativas e nos produtos em destaque.

Escopo previsto:

- Selecionar automaticamente ofertas e destaques relevantes.
- Gerar arte respeitando logo, cores e identidade visual do tenant.
- Criar variacoes para site publico, redes sociais e campanhas.
- Permitir preview, edicao simples e aprovacao antes de publicar.

## Decisoes de Organizacao

- O roadmap oficial fica somente em `admin-ofertas-front/Roadmap-Admin-Ofertas.md`.
- O arquivo `api-ofertas/roadmap.md` foi removido para evitar duplicidade.
- Documentacoes tecnicas separadas continuam existindo:
  - `admin-ofertas-front/DOCUMENTACAO-FRONTEND.md`
  - `api-ofertas/DOCUMENTACAO-API.md`

## Proximo Marco Recomendado

Estabilizar o ciclo operacional do cliente:

1. Superadmin cadastra cliente.
2. Cliente recebe/acessa credencial inicial.
3. Cliente troca senha.
4. Cliente configura empresa e logo.
5. Cliente cadastra ou importa ofertas.
6. Site publico reflete branding e ofertas.
7. Cliente consegue recuperar senha por e-mail.
8. Cliente recebe e atende pedidos pelo painel.
9. Cliente exporta fechamento do dia por CSV ou consulta via API.
