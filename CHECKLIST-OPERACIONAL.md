# Checklist Operacional - Admin Ofertas

Atualizado em 27/05/2026.

Guia rapido para colocar um cliente em operacao e validar o ciclo completo do sistema.

## 1. Cadastrar Cliente

No Super Admin, acesse:

```text
/super-admin/clientes
```

Confira:

- Nome do cliente preenchido.
- Slug unico.
- Dominio publico correto, quando houver.
- Cliente ativo.
- Usuario admin criado com nome, e-mail e senha inicial.
- Login do admin do cliente funcionando.

## 2. Configurar Storage S3/MinIO

No Super Admin, acesse:

```text
/super-admin/configuracoes
Categoria: storage
```

Campos esperados:

| Chave | Observacao |
| --- | --- |
| `endpoint` | Endpoint S3/MinIO |
| `region` | Regiao, normalmente `us-east-1` |
| `access_key` | Chave de acesso |
| `secret_key` | Segredo, marcar como secreto |
| `bucket` | Bucket usado para arquivos |
| `public_url` | URL publica dos arquivos |
| `acl` | Opcional |

Validar:

- Upload de logo funciona.
- Preview da logo carrega.
- URL publica da logo abre no navegador.
- `public_url` nao duplica o bucket.

## 3. Configurar SMTP

No Super Admin, acesse:

```text
/super-admin/configuracoes
Categoria: email
```

Campos esperados:

| Chave | Exemplo | Observacao |
| --- | --- | --- |
| `host` | `smtppro.zoho.com` | Servidor SMTP |
| `port` | `465` | `465` com SSL ou `587` com STARTTLS |
| `user` | `financeiro@wrtec.com.br` | Usuario SMTP |
| `password` | `********` | Senha/app password, marcar como secreto |
| `from` | `Admin Ofertas <financeiro@wrtec.com.br>` | Remetente autorizado |
| `secure` | `true` | `true` para 465, `false` para 587 |
| `reset_url` | `https://admin-ofertas.wrtec.com.br` | Base do link de redefinicao |

Validar:

- Recuperacao de senha envia e-mail.
- Link de redefinicao abre corretamente.
- Nova senha e aceita no login.

## 4. Configurar Empresa

No painel do cliente, acesse:

```text
/configuracoes
```

Preencher:

- Nome.
- Descricao.
- Dominio.
- Telefone.
- E-mail.
- WhatsApp.
- Endereco.
- Redes sociais.
- Horarios.
- Logo.
- Paleta de cores.
- Fonte.

Validar:

- Preview visual carrega a logo.
- Link do preview abre o site publico.
- Site publico aplica logo, cores e dados da empresa.

## 5. Habilitar Pedidos

Na tela de configuracoes da empresa:

- Ativar pedidos/lista.
- Preencher e-mail de recebimento de pedidos.
- Preencher WhatsApp de recebimento de pedidos.
- Conferir mensagem padrao de WhatsApp, se configurada.
- Definir tempo de carrinho abandonado em minutos.

Sugestao inicial:

```text
Tempo de carrinho abandonado: 30 minutos
```

## 6. Cadastrar ou Importar Dados

Opcoes:

- Cadastro manual pelo painel.
- Importacao CSV.
- Integracao por API Key.

Validar:

- Filiais ativas.
- Categorias ativas.
- Produtos com codigo interno ou EAN.
- Produtos com imagens quando disponivel.
- Ofertas ativas.
- Vigencia correta.
- Destaques configurados.

## 7. Testar Site Publico

Acessar o dominio publico do cliente.

Validar:

- Logo carregando.
- Cores aplicadas.
- Ofertas em destaque.
- Lista de ofertas.
- Produtos.
- Lojas.
- Categorias.
- Botao de adicionar a lista aparecendo quando pedidos estiverem ativos.

## 8. Testar Pedido

No site publico:

1. Adicionar um produto a lista.
2. Informar nome e WhatsApp.
3. Alterar quantidade.
4. Adicionar outro produto.
5. Finalizar pedido.

Validar:

- Pedido foi salvo.
- Carrinho local foi limpo apos envio.
- E-mail chegou no destinatario configurado.
- WhatsApp abriu com a mensagem correta.
- Titulo/mensagem indicam pedido do site de ofertas.

## 9. Conferir no Painel

No admin:

```text
/pedidos
```

Validar:

- Pedido aparece como pendente.
- Itens aparecem corretamente.
- Total estimado confere.
- Historico de status mostra criacao pelo site.
- Alterar para `Em atendimento` cria historico.
- Alterar para `Concluido` cria historico.

Na mesa de atendimento:

```text
/atendimento
```

Validar:

- Pedido pendente aparece em `Novos pedidos`.
- Som toca quando entra pedido novo.
- Botao `Iniciar atendimento` move para `Em atendimento`.
- Botao `Concluir pedido` move para fechamento.
- Atalho `Concluidos hoje` mostra o pedido.
- Atalho `Cancelados hoje` funciona quando houver cancelamento.

## 10. Fechamento do Dia

No painel:

```text
/relatorios
```

Exportar e conferir:

- Pedidos do Site.
- Itens dos Pedidos.
- Historico de Status.
- Carrinhos e Abandonos.
- Resumo de Pedidos.

Usar filtros:

- Data inicial.
- Data final.
- Status do pedido.
- Status do carrinho.

## 11. Diagnostico Rapido

Health publico do admin:

```text
https://admin-ofertas.wrtec.com.br/health
```

Health direto da API:

```text
https://api-ofertas.wrtec.com.br/health
```

Validar:

- Frontend admin operacional.
- API operacional.
- Banco operacional.
- Latencia aceitavel.

## 12. Sinais de Problema

Se o pedido nao chega:

- Conferir se `orders_enabled` esta ativo.
- Conferir se o site publico carregou configuracoes atualizadas.
- Conferir `/health`.
- Conferir logs da API no Portainer.

Se e-mail nao chega:

- Conferir SMTP no Super Admin.
- Conferir `host`, `port`, `secure`, `user`, `password` e `from`.
- Conferir se o provedor exige app password.
- Conferir logs da API.

Se logo nao aparece:

- Conferir `storage.public_url`.
- Conferir `storage.bucket`.
- Abrir a URL da logo diretamente no navegador.
- Conferir se o bucket esta publico ou se o proxy publica os arquivos.

Se deploy nao sobe:

- Conferir logs do container.
- Conferir erro de migration Prisma.
- Conferir se o banco esta acessivel.
- Conferir se a imagem nova foi publicada.

