# Auditoria Visual - Admin Ofertas

Use este roteiro para revisar telas novas ou existentes antes de validar uma entrega.

## 1. Objetivo da Tela

- A tela deixa claro qual trabalho o usuario veio fazer?
- A acao principal esta visivel sem precisar procurar?
- Existem elementos promocionais, decorativos ou explicativos demais?
- A tela evita comportamento de landing page quando deveria ser operacional?

## 2. Permissoes e Contexto

- O usuario ve apenas atalhos e rotas permitidas pelo perfil?
- Admin de tenant ve apenas dados da propria empresa?
- Super Admin esta separado das telas de tenant?
- Estados sensiveis, como API Keys, usuarios e configuracoes, exigem perfil correto?

## 3. Hierarquia Visual

- H1, subtitulo, filtros, conteudo e acoes estao em ordem logica?
- Cards e paineis representam unidades reais de informacao?
- Nao ha card dentro de card?
- Acoes destrutivas nao competem visualmente com a acao principal?

## 4. Estados da Interface

Confirmar que existem estados para:

- Carregando
- Vazio
- Erro
- Sucesso
- Salvando/enviando
- Sem permissao

## 5. Formularios

- Todos os campos tem label visivel?
- Campos obrigatorios sao claros?
- Senhas e segredos nao sao expostos?
- Mensagens de erro sao amigaveis?
- Em edicao, campos opcionais indicam que sao opcionais?

## 6. Tabelas e Listas

- Dados longos, como e-mail e nomes de produto, nao quebram o layout?
- Acoes de linha estao consistentes?
- Existe busca ou filtro quando a lista tende a crescer?
- Estado vazio explica o proximo passo?

## 7. Responsividade

- A tela funciona em notebook, desktop largo e largura mobile?
- Botoes nao estouram o container?
- Formularios laterais viram blocos empilhados em telas menores?
- Textos nao sobrepoem cards, tabelas ou botoes?

## 8. Acessibilidade Pratica

- Contraste de texto esta legivel?
- Botao desabilitado parece desabilitado?
- Inputs mantem foco visivel?
- Links parecem links?
- Mensagens importantes nao dependem apenas de cor.

## 9. Performance e Operacao

- A tela evita buscar dados desnecessarios?
- Auto-refresh nao interrompe edicao ou atendimento?
- Sons/alertas sao usados apenas quando trazem valor operacional?
- Exportacoes/importacoes mostram feedback suficiente?

## 10. IA e Imagens

- Imagem real e claramente preferida a imagem gerada?
- Imagem gerada, quando usada, esta marcada como fallback?
- Sugestoes da IA exigem aprovacao antes de publicar?
- A fonte e confianca do enriquecimento estao registradas?

## Resultado da Auditoria

Use este bloco em PRs, commits ou anotacoes internas:

```txt
Tela revisada:
Perfil testado:
Desktop:
Mobile:
Estados conferidos:
Problemas encontrados:
Pendencias:
Decisao:
```
