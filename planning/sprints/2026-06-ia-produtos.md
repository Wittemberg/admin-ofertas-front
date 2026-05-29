# Sprint Planejada - IA para Produtos

## Identificacao

- Data prevista: Junho/2026
- Repositorios provaveis: `admin-ofertas-front`, `api-ofertas`
- Status: Em andamento

## Objetivo

Reduzir trabalho manual no cadastro visual e classificacao de produtos usando IA e enriquecimento por barcode, nome e marca.

## Contexto

Open Food Facts e Open Products Facts possuem cobertura limitada para produtos brasileiros. Por isso, o ERP/importacao deve ser a fonte principal de barcode, nome e marca. Bases abertas entram como apoio, e a IA/web deve complementar a busca por imagem real.

## Escopo Inicial

- Criar base propria de enriquecimento por barcode.
- Buscar imagem real usando `barcode + nome + marca`.
- Registrar fonte, confianca, status e aprovacao.
- Criar fila/tela de revisao para resultados de baixa confianca.
- Permitir aprovar, recusar ou substituir imagem sugerida.
- Reaproveitar metadados aprovados entre tenants quando fizer sentido.

## Fora de Escopo Inicial

- Geracao automatica de banners.
- Sugestao de ofertas baseada em venda/margem.
- Automacao completa sem aprovacao humana.
- Substituir o cadastro oficial do ERP.

## Decisoes

- Imagem real tem prioridade sobre imagem gerada.
- Imagem gerada, quando usada, precisa ser marcada como fallback/nao-real.
- Barcode isolado nao e suficiente; busca deve considerar nome e marca.
- Toda sugestao visual deve passar por preview e aprovacao.
- Nao armazenar credenciais de APIs externas em arquivos versionados.

## Modelo de Dados Sugerido

Tabela ou entidade de enriquecimento:

- `barcode`
- `product_name`
- `brand`
- `category_suggested`
- `image_url`
- `source`
- `confidence`
- `status`
- `approved_at`
- `approved_by`
- `created_at`
- `updated_at`

Status possiveis:

- `pending`
- `suggested`
- `approved`
- `rejected`
- `manual`

## Fluxo Sugerido

1. Produto entra por ERP, API ou CSV com barcode/nome/marca.
2. Sistema procura enriquecimento aprovado local por barcode.
3. Se nao existir, consulta fontes auxiliares abertas quando aplicavel.
4. Se ainda nao houver resultado, busca web/IA com barcode, nome e marca.
5. Resultado recebe score de confianca.
6. Alta confianca pode ser sugerida em destaque.
7. Baixa confianca vai para fila de revisao.
8. Admin aprova ou recusa.
9. Produto passa a usar imagem/metadados aprovados.

## Criterios de Aceite

- Admin consegue solicitar enriquecimento para um produto.
- Sistema nao publica imagem automaticamente sem aprovacao.
- Resultado mostra fonte e confianca.
- Admin consegue aprovar ou recusar.
- Produto aprovado exibe a imagem no admin e no site publico.
- Produtos sem resultado confiavel permanecem sem imagem real ou usam fallback identificado.

## Entrega 1

Implementada a base inicial da sprint:

- Tabela `product_enrichments` na API.
- Endpoint para listar fila de revisao.
- Endpoint para buscar sugestao automatica por barcode.
- Endpoint para criar sugestao manual por URL.
- Endpoint para atualizar URL/observacao da sugestao.
- Endpoint para aprovar e aplicar imagem no produto.
- Endpoint para recusar sugestao.
- Tela `/produtos/ia` no admin.
- Atalho `IA Produtos` no dashboard para perfis `admin` e `editor`.

## Entrega 2

Implementada a busca web ranqueada:

- Categoria `ai` no Super Admin para configurar busca web.
- Chaves `tavily_api_key` e `serpapi_api_key` como parametros secretos.
- Parametros `web_search_enabled` e `web_search_provider`.
- Endpoint `/products/:id/enrichment/web-search`.
- Busca ate 3 imagens ranqueadas por similaridade com barcode, nome e dominio.
- Tela `/produtos/ia` com acao `Buscar na web`.
- Sugestoes entram na fila normal de revisao, sem publicacao automatica.

Limitacoes conhecidas:

- Open Food Facts/Open Products Facts continuam como fontes auxiliares e podem nao encontrar produtos brasileiros.
- Busca web depende de credito/disponibilidade dos provedores configurados.
- Imagem gerada por IA ainda nao faz parte do fluxo.

## Checklist Visual

- Usar `design-system/AUDITORIA-VISUAL.md`.
- Preview de imagem precisa ser claro.
- Status de confianca precisa ser visivel.
- Acoes de aprovar/recusar devem ser inequívocas.
- Tela deve funcionar bem com muitos produtos pendentes.
