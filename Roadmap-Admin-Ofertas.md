# Roadmap - Admin Ofertas

Atualizado em 26/05/2026.

Este e o roadmap central do projeto Ofertas. Ele consolida o que antes estava dividido entre `admin-ofertas-front/Roadmap-Admin-Ofertas.md` e `api-ofertas/roadmap.md`.

Repositorios relacionados:

- `admin-ofertas-front`: painel administrativo e Super Admin
- `api-ofertas`: API, banco, integracoes, tenant settings e arquivos
- `app-ofertas`: site publico de ofertas consumido pelos clientes finais

## Status Geral

O projeto ja possui base funcional em producao, com deploy automatizado via GitHub Actions, Portainer, Docker Swarm e Traefik. O foco atual e estabilizar o Admin Ofertas, fechar o ciclo de cadastro/gestao de clientes, validar recuperacao de senha em producao e melhorar a experiencia visual das telas administrativas.

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
- Configuracoes SMTP centralizadas no Super Admin.
- API Keys para integracoes externas.

### Painel administrativo

- Dashboard com indicadores de produtos, lojas, categorias e ofertas.
- Graficos simples de ofertas por loja e produtos por categoria.
- CRUD de produtos.
- CRUD de filiais.
- CRUD de categorias.
- CRUD visual de ofertas.
- Importacao CSV de ofertas.
- Importacao CSV de filiais.
- Importacao CSV de categorias.
- Relatorios CSV.
- Gestao de API Keys.
- Tela de configuracoes da empresa.
- Link para Super Admin visivel apenas para superadmin.
- Link de troca de senha no dashboard.
- Navegacao de retorno padronizada nas telas principais.

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

### Site publico

- Consumo de tenant publico por dominio.
- Consumo de ofertas publicas.
- Consumo de produtos publicos.
- Consumo de filiais publicas.
- Consumo de categorias publicas.
- Aplicacao de branding vindo do tenant: logo, cores, fonte, contatos e dados da empresa.

### Documentacao

- `DOCUMENTACAO-FRONTEND.md` atualizado.
- `DOCUMENTACAO-API.md` atualizado.
- Roadmap consolidado neste arquivo.
- Roadmap duplicado da API removido.

## Em Validacao

### Recuperacao de senha por e-mail

Implementado no front e na API. Falta validar em producao com o provedor SMTP definitivo.

Pontos de atencao:

- `from` precisa ser autorizado pelo provedor SMTP.
- Para Zoho, preferir remetente igual ao usuario autenticado ou alias validado.
- `reset_url` deve apontar para `https://admin-ofertas.wrtec.com.br`.
- Erros SMTP agora devem voltar com mensagem mais clara pela API.

### Cadastro e manutencao de clientes

Implementado no Super Admin. Falta validar o fluxo completo em producao:

- Criar cliente.
- Criar admin inicial.
- Fazer login com o novo admin.
- Alterar dados do cliente.
- Desativar cliente e confirmar bloqueio de login.
- Reativar cliente e confirmar login.

### Branding e logo

Implementado e ajustado. Falta validar em producao com storage real:

- Upload de logo.
- Geracao de paleta.
- Preview imediato no admin.
- Persistencia depois de sair e voltar na tela.
- Exibicao da logo no `app-ofertas`.

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

Pendencias:

- Criar checklist de deploy.
- Criar checklist de cadastro de novo cliente.
- Criar guia rapido de configuracao SMTP.
- Criar guia rapido de configuracao S3/MinIO.
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

### Performance e escalabilidade

Pendencias:

- Revisar paginacao de produtos e ofertas em bases maiores.
- Revisar indices do banco para buscas frequentes.
- Revisar limite de importacao CSV.
- Revisar timeout para uploads e imports.

## Roadmap de IA

### 1. Busca automatica de imagens de produto

Prioridade: Media. Impacto: Alto.

Objetivo: reduzir trabalho manual no cadastro visual do catalogo.

Escopo previsto:

- Buscar imagem por nome, EAN e marca.
- Evitar imagens genericas ou erradas.
- Sugerir imagem ao usuario antes de salvar.
- Endpoint sugerido: `POST /products/:id/fetch-image`.
- Interface de preview no frontend para aceitar ou recusar.

### 2. Sugestao de categoria

Prioridade: Baixa. Impacto: Medio.

Objetivo: sugerir categoria automaticamente a partir do nome do produto, descricao e historico do tenant.

### 3. Geracao de descricao de produto

Prioridade: Baixa. Impacto: Medio.

Objetivo: gerar descricoes comerciais para produtos usando nome, unidade, categoria e marca.

### 4. Enriquecimento por codigo de barras

Prioridade: Media. Impacto: Alto.

Objetivo: consultar bases externas por EAN para preencher nome oficial, marca, fabricante e imagem.

### 5. Ofertas inteligentes

Prioridade: Futura. Impacto: Muito alto.

Objetivo: sugerir ofertas com base em historico de vendas, margem, sazonalidade e comportamento de consumo.

## Decisoes de Organizacao

- O roadmap oficial fica somente em `admin-ofertas-front/Roadmap-Admin-Ofertas.md`.
- O arquivo `api-ofertas/roadmap.md` foi removido para evitar duplicidade.
- Documentacoes tecnicas separadas continuam existindo:
  - `admin-ofertas-front/DOCUMENTACAO-FRONTEND.md`
  - `api-ofertas/DOCUMENTACAO-API.md`

## Proximo Marco Recomendado

Estabilizar o ciclo completo de cliente:

1. Superadmin cadastra cliente.
2. Cliente recebe/acessa credencial inicial.
3. Cliente troca senha.
4. Cliente configura empresa e logo.
5. Cliente cadastra ou importa ofertas.
6. Site publico reflete branding e ofertas.
7. Cliente consegue recuperar senha por e-mail.
