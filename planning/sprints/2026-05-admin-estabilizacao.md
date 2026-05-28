# Sprint - Estabilizacao Admin Ofertas

## Identificacao

- Data: Maio/2026
- Repositorios impactados: `admin-ofertas-front`, `api-ofertas`, `app-ofertas`
- Status: Concluida

## Objetivo

Colocar o projeto em operacao funcional, com admin restaurado, pedidos/listas funcionando e base operacional documentada.

## Escopo Entregue

- Correcoes no admin e API para tenant settings.
- Branding/logo com preview funcional.
- Super Admin com cadastro/manutencao de clientes.
- Recuperacao de senha por e-mail.
- Cadastro de usuarios por tenant e perfis basicos.
- Carrinho/lista no site publico.
- Envio de pedido por e-mail e WhatsApp.
- Pedidos e atendimento operacional no admin.
- Alertas sonoros para novo pedido.
- Dashboard com metricas de pedidos/carrinhos.
- Exportacoes CSV e API de integracao equalizadas.
- Healthcheck real da API e pagina publica de status do admin.
- Checklist operacional.
- Design system e auditoria visual.
- Harmonizacao visual inicial dos CRUDs antigos.

## Decisoes

- Deploy continua via GitHub Actions e Portainer.
- Migrations devem passar no deploy; em caso de falha, resolver historico do Prisma com cuidado.
- API e CSV devem cobrir os mesmos dados operacionais quando possivel.
- Super Admin nao deve se misturar com telas de tenant.
- Admin de tenant so ve usuarios da propria empresa.

## Validacoes Realizadas

- Build do admin executado em multiplas entregas.
- Deploys acionados via push.
- Recuperacao de senha validada pelo usuario.
- Branding/logo validado pelo usuario.
- Clientes no Super Admin validados pelo usuario.
- Som de novo pedido validado pelo usuario.
- Campo de carrinho abandonado validado pelo usuario.
- Migration final de pedidos/status passou no ambiente.

## Pendencias Herdadas

- Validar visualmente em producao a harmonizacao dos CRUDs apos deploy.
- Definir se usuarios operadores precisam ficar vinculados a filial especifica.
- Preparar sprint de IA com criterios de aceite claros.
