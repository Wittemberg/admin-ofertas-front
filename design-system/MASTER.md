# Design System - Admin Ofertas

Este documento define o padrao visual e de UX do painel Admin Ofertas. Ele deve ser usado como referencia antes de criar novas telas, revisar interfaces existentes ou implementar recursos de IA que gerem elementos visuais.

## Principios

- O painel e uma ferramenta operacional. Priorize clareza, velocidade e previsibilidade.
- Evite composicao de landing page: hero grande, textos promocionais, excesso de cards decorativos ou gradientes.
- Cada tela deve deixar claro o trabalho principal: cadastrar, revisar, atender, importar, exportar ou configurar.
- Interfaces devem funcionar bem em uso repetido, com leitura rapida e baixa friccao.
- Super Admin, Admin do tenant, Operador, Editor e Visualizador devem perceber apenas o que precisam usar.

## Linguagem Visual

### Layout

- Fundo geral: cinza claro neutro, como `bg-gray-100` ou `bg-slate-100`.
- Conteudo principal: largura maxima entre `max-w-6xl` e `max-w-7xl`, salvo telas densas.
- Cards e paineis: usar apenas para unidades reais de conteudo, formularios, tabelas, modais e metricas.
- Evitar card dentro de card.
- Separar secoes com espacamento, borda sutil ou faixa de fundo, nao com decoracao pesada.

### Bordas e Sombras

- Raio padrao: `rounded-lg`.
- Bordas: `border-gray-200` ou `border-slate-200`.
- Sombras: `shadow-sm` ou `shadow`, apenas onde ajuda a hierarquia.
- Evitar sombras fortes e elementos flutuantes sem funcao.

### Cores

Paleta base:

- Acao primaria: azul `#2563eb` / Tailwind `blue-600`.
- Sucesso: verde/esmeralda `emerald-600`.
- Alerta/atencao: amarelo/amber `amber-500`.
- Erro: vermelho `red-600`.
- Texto principal: `slate-900` ou `gray-900`.
- Texto secundario: `slate-500` ou `gray-500`.
- Fundo: `gray-100` ou `slate-100`.
- Super Admin pode usar roxo como acento, mas sem dominar a tela.

Regras:

- Nao usar uma tela inteira baseada em uma unica cor.
- Reservar cores fortes para acoes, estados e metrica importante.
- Evitar gradientes ornamentais.

### Tipografia

- Fonte padrao: Inter ou fallback sans-serif.
- H1 de tela: `text-2xl font-bold`.
- H2 de secao: `text-lg` ou `text-xl font-bold`.
- Texto auxiliar: `text-sm text-gray-500`.
- Labels: `text-sm font-medium`.
- Nao escalar fonte com viewport.
- Nao usar letter-spacing negativo.

## Componentes

### Botoes

- Primario: fundo azul, texto branco, altura confortavel.
- Secundario: borda neutra, fundo branco.
- Destrutivo: texto ou borda vermelha; fundo vermelho apenas em confirmacoes claras.
- Estado carregando: desabilitar botao e trocar texto para "Salvando...", "Enviando..." ou equivalente.
- Nao usar botoes como decoracao.

### Links de Retorno

Padrao:

```txt
<- Voltar ao Dashboard
```

- Deve ficar no topo da tela.
- Usar texto pequeno em azul.
- Manter capitalizacao consistente.

### Formularios

- Labels sempre visiveis.
- Inputs com borda, raio e padding consistentes.
- Mensagens de erro proximo ao contexto ou no topo do formulario.
- Formulario lateral pode ser usado em telas de manutencao, como clientes e usuarios.
- Campos sensiveis devem indicar quando sao opcionais em edicao.

### Tabelas e Listas

- Usar tabelas para dados tabulares.
- Usar lista em cards quando a entidade tem poucas informacoes e acao direta.
- Sempre mostrar estado vazio claro.
- Acoes de linha devem ficar alinhadas a direita.
- Evitar quebra visual quando nomes/e-mails forem longos.

### Cards de Metrica

- Numero grande, rotulo pequeno.
- Cores por categoria apenas como acento.
- Evitar excesso de texto dentro do card.
- Dashboard deve mostrar atalhos primeiro e indicadores depois, conforme decisao atual.

### Mensagens

- Sucesso: fundo verde claro, borda verde, texto verde escuro.
- Erro: fundo vermelho claro, borda vermelha, texto vermelho escuro.
- Aviso: fundo amarelo claro, borda amarela, texto escuro.
- Preferir mensagens amigaveis a erros crus da API.

## Telas Principais

### Login

- Tela simples, centralizada.
- Deve conter:
  - email
  - senha
  - esqueci a senha
  - status dos servicos
- Nao mostrar elementos internos do produto antes da autenticacao.

### Dashboard

- Atalhos aparecem antes das metricas.
- Atalhos devem respeitar o perfil do usuario.
- Indicadores operacionais devem ser escaneaveis.
- Link de Super Admin aparece apenas para `superadmin`.

### Usuarios da Empresa

- Visao exclusiva do tenant.
- Deve listar apenas usuarios da propria empresa.
- Nao deve listar `superadmin`.
- Admin nao pode desativar a si mesmo nem trocar o proprio perfil.

### Super Admin

- Deve parecer administrativo, nao operacional.
- Separar clientes, configuracoes globais e auditoria.
- Nunca misturar dados operacionais de um tenant dentro de uma tela global sem contexto claro.

### Atendimento

- Prioridade para pedidos pendentes e em atendimento.
- Filtros de concluidos/cancelados devem existir sem atrapalhar a operacao principal.
- Alertas sonoros e visuais devem chamar atencao sem bloquear o trabalho.

### Configuracoes da Empresa

- Separar identidade visual, contatos, pedidos e dados institucionais.
- Preview visual deve abrir o site publico quando fizer sentido.
- Campos de pedidos devem explicar impacto operacional.

## IA e Conteudo Visual

- Imagens reais de produto devem ter preferencia sobre imagens geradas.
- Imagens geradas precisam ser marcadas como nao-reais quando usadas como fallback.
- Banners gerados por IA devem respeitar logo, cores, identidade visual e ofertas ativas.
- Toda sugestao visual da IA deve passar por preview e aprovacao antes de publicar.

## Checklist Rapido

Antes de finalizar uma tela, confirme:

- A acao principal esta obvia.
- O usuario ve apenas o que seu perfil permite.
- Nao ha texto quebrando ou sobrepondo elementos.
- Existe estado vazio, carregando, erro e sucesso.
- A tela funciona em largura menor.
- As cores ajudam a hierarquia, nao decoram sem funcao.
- O padrao visual conversa com as outras telas do painel.
