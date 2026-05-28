# Projeto - Admin Ofertas

Este documento centraliza o contexto operacional do projeto Ofertas. Ele existe para manter continuidade entre sprints, reduzir perda de contexto e guiar decisoes sem depender de ferramenta externa.

## Objetivo do Produto

Sistema SaaS multi-tenant para supermercados publicarem ofertas, receberem listas/pedidos do site publico e integrarem dados com ERP por API ou CSV.

## Repositorios

- `admin-ofertas-front`: painel administrativo, Super Admin, documentacao oficial, roadmap e planejamento.
- `api-ofertas`: API, banco, autenticacao, integracoes, pedidos, uploads e regras multi-tenant.
- `app-ofertas`: site publico do cliente, catalogo/ofertas e carrinho/lista de pedidos.

## Usuarios Principais

- Super Admin: cadastra clientes, configura parametros globais, acompanha auditoria.
- Admin do tenant: configura empresa, usuarios, API Keys, ofertas, importacoes e operacao.
- Editor: mantem catalogo, filiais, categorias, ofertas e importacoes.
- Operador: atende pedidos/listas do site.
- Visualizador: consulta dashboard e relatorios.
- Consumidor final: acessa site publico, monta lista e envia pedido.

## Principios de Produto

- Operacional antes de decorativo.
- Multi-tenant isolado por empresa.
- Fluxos com API e CSV devem ficar equivalentes sempre que possivel.
- Erros devem ser amigaveis no frontend e padronizados na API.
- Toda tela nova deve passar pelo checklist visual em `design-system/AUDITORIA-VISUAL.md`.
- Credenciais, chaves, senhas e dados sensiveis nao devem ser documentados em arquivos versionados.

## Ambientes e Dominios Principais

- Admin: `https://admin-ofertas.wrtec.com.br`
- API: `https://api-ofertas.wrtec.com.br`
- Health Admin: `https://admin-ofertas.wrtec.com.br/health`

## Stack

- Frontend admin: React, Vite, TailwindCSS, Axios.
- API: Node.js, Fastify, Prisma, PostgreSQL.
- Public app: React/Vite.
- Deploy: GitHub Actions, Portainer, Docker Swarm, Traefik.

## Documentos de Referencia

- Roadmap oficial: `Roadmap-Admin-Ofertas.md`
- Frontend: `DOCUMENTACAO-FRONTEND.md`
- API: `../api-ofertas/DOCUMENTACAO-API.md`
- Integracao ERP: `../api-ofertas/DOCUMENTACAO-INTEGRACAO.md`
- Checklist operacional: `CHECKLIST-OPERACIONAL.md`
- Design system: `design-system/MASTER.md`
- Auditoria visual: `design-system/AUDITORIA-VISUAL.md`
