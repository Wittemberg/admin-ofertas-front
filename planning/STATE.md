# Estado Atual

Atualizado em: 2026-05-28

## Status Geral

Projeto operacional e estabilizado para a etapa atual. Admin, API e site publico ja possuem fluxo funcional de cadastro, ofertas, pedidos/listas, relatorios, integracao e diagnostico.

## Feito

- Recuperacao de senha por e-mail validada.
- Cadastro e manutencao de clientes no Super Admin validado.
- Branding e logo validado.
- Configuracoes de SMTP e S3 operacionais.
- Pedidos/listas no site publico com envio por e-mail e WhatsApp.
- Carrinhos e abandonos com metricas no dashboard.
- Atendimento operacional com som para novo pedido.
- Filtros de pedidos, fechamento diario, concluidos e cancelados.
- Healthcheck da API e pagina publica `/health` no admin.
- Checklist operacional criado.
- Usuarios por tenant com perfis `admin`, `editor`, `operator`, `viewer`.
- Permissoes basicas aplicadas no frontend e backend.
- Super Admin separado das telas operacionais do tenant.
- Design system e auditoria visual versionados.
- Sprint visual inicial aplicada nos CRUDs antigos.

## Decisoes Recentes

- O roadmap oficial fica em `admin-ofertas-front/Roadmap-Admin-Ofertas.md`.
- Open Food Facts/Open Products Facts serao fontes auxiliares na sprint de IA, nao fonte principal.
- ERP/importacao sera fonte principal de barcode, nome e marca.
- A IA deve buscar imagem usando `barcode + nome + marca`.
- Criar base propria de enriquecimento por barcode, com fonte, confianca e aprovacao.
- Imagem gerada por IA, quando usada, precisa ser marcada como fallback/nao-real.

## Pendencias Conhecidas

- Revisao visual fina ainda pode ser feita tela por tela apos deploy da harmonizacao.
- Validar em producao os perfis de usuario com contas reais.
- Criar mecanismo de vinculo de operador por filial, caso vire requisito.
- Preparar sprint de IA com escopo fechado antes de implementar.
- Definir fonte comercial ou fluxo web/IA para barcode brasileiro, se Open Food Facts for insuficiente.

## Marco Atual

Sprint de IA iniciada com foco inicial em enriquecimento de produtos:

1. Base propria de enriquecimento por barcode.
2. Busca de imagem real por barcode, nome e marca.
3. Fila de revisao/aprovacao.
4. Sugestao de categoria e metadados como fase seguinte.
5. Banners promocionais como fase posterior.

## Entregue na Sprint de IA 1

- Modelo `product_enrichments` planejado para armazenar barcode, nome, marca, categoria sugerida, imagem, fonte, confianca e status.
- Rotas administrativas para criar sugestoes, revisar, aprovar e recusar.
- Tela `/produtos/ia` para fila de revisao e aprovacao manual.
- Fontes abertas usadas como auxiliares: Open Food Facts e Open Products Facts.
- Base propria reaproveita enriquecimentos aprovados anteriormente pelo mesmo barcode.
- Busca web adicionada com configuracao `ai` no Super Admin.
- Tavily e SerpAPI podem gerar ate 3 sugestoes ranqueadas para revisao manual.
- `web_scraping_sites` permite priorizar sites brasileiros cadastrados antes dos provedores externos.
