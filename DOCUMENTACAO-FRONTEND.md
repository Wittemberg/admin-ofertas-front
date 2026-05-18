Admin Ofertas

DOCUMENTAÇÃO TÉCNICA FRONTEND

Sistema de Gestão de Ofertas e Produtos

17 de maio de 2026

---

## DOCUMENTACAO-FRONTEND.md

### 1. Visão Geral

A Single Page Application (SPA) é construída utilizando React 19, Vite 8 e TailwindCSS 4. O sistema consome a API REST do repositório api-ofertas para realizar a gestão completa de produtos, filiais, categorias e ofertas, incluindo funcionalidades avançadas de importação via arquivos CSV. O foco da aplicação é fornecer uma interface administrativa robusta, performática e de fácil manutenção para o gerenciamento de campanhas promocionais em redes de varejo.

### 2. Stack Tecnológica

Abaixo estão listadas as principais tecnologias e bibliotecas que compõem o ecossistema do frontend:




Tecnologia
Versão
Função




React
^19.2.6
Framework UI


Vite
^8.0.12
Build tool + dev server


TailwindCSS
^4.3.0
CSS utility-first


React Router DOM
^7.15.1
Roteamento SPA


Axios
^1.16.1
Cliente HTTP


@tailwindcss/vite
^4.3.0
Plugin Tailwind para Vite


ESLint
^10.3.0
Linter e padronização




### 3. Estrutura de Diretórios

A organização do projeto segue as melhores práticas para aplicações React escaláveis, separando responsabilidades entre lógica de API, contexto global e componentes de página:

```
admin-ofertas-front/
├── .github/workflows/       # CI/CD — GitHub Actions
├── public/                  # Assets estáticos
├── src/
│   ├── api/                 # Camada de comunicação com a API
│   │   ├── axios.js         # Instância Axios (baseURL, interceptors JWT)
│   │   ├── products.js      # CRUD de produtos
│   │   ├── stores.js        # CRUD de filiais
│   │   ├── categories.js    # CRUD de categorias
│   │   └── offers.js        # CRUD de ofertas
│   ├── context/
│   │   └── AuthContext.jsx  # Estado global de autenticação (JWT)
│   ├── pages/
│   │   ├── Login.jsx        # Tela de login
│   │   ├── Dashboard.jsx    # Dashboard com métricas + navegação
│   │   ├── Products.jsx     # CRUD de produtos com modal
│   │   ├── Stores.jsx       # CRUD de filiais com modal
│   │   ├── Categories.jsx   # CRUD de categorias com modal
│   │   ├── Offers.jsx       # Visualização de ofertas
│   │   └── ImportCSV.jsx    # Importação CSV com abas
│   └── App.jsx             # Configuração de rotas + ProtectedRoute
├── .dockerignore
├── .gitignore
├── Dockerfile               # Build multi-stage (node → nginx)
├── eslint.config.js
├── nginx.conf               # Configuração Nginx para SPA
├── package.json
└── vite.config.js
```

### 4. Páginas

#### 4.1 Login.jsx
Formulário de autenticação que solicita as credenciais de acesso (e-mail e senha). O componente consome o endpoint POST /auth/login. Após a validação bem-sucedida, o token JWT é armazenado no AuthContext e persistido no localStorage para manter a sessão ativa.

#### 4.2 Dashboard.jsx
Página inicial pós-autenticação que apresenta métricas consolidadas do sistema, como total de produtos cadastrados, ofertas ativas e número de filiais. Oferece atalhos de navegação rápida para todos os módulos administrativos.

#### 4.3 Products.jsx
Interface de gerenciamento de produtos com tabela dinâmica, busca por nome e paginação configurada para 10 itens por página. Inclui modal para cadastro e edição de campos como nome, código interno, código de barras, unidade e categoria, além de rotina de exclusão com confirmação.

#### 4.4 Stores.jsx
Listagem de filiais exibindo Nome, Slug, Cidade, Estado, Telefone e Status. Implementa um sistema de autoslug que gera o identificador único automaticamente ao digitar o nome da loja. O modal de edição permite a gestão completa de endereços e contatos.

#### 4.5 Categories.jsx
Módulo simplificado para organização taxonômica dos produtos. Exibe Nome, Slug e Status, permitindo a criação e edição rápida de categorias para filtragem no catálogo.

#### 4.6 Offers.jsx
Visualização centralizada de ofertas vigentes, integrando dados de produtos e filiais. Permite filtragem avançada por store_id, product_id e status de destaque (is_featured).

#### 4.7 ImportCSV.jsx
Ferramenta de processamento em lote dividida em três abas: Importar Ofertas, Importar Filiais e Importar Categorias. Suporta drag-and-drop, validação de extensão de arquivo e fornece preview dinâmico do formato esperado. Retorna feedback detalhado sobre linhas processadas, erros e avisos.

### 5. API Layer

#### 5.1 axios.js
Configuração centralizada do cliente HTTP. Define a baseURL da API e implementa interceptores de requisição para injetar o token JWT no header Authorization. Possui interceptor de resposta para capturar erros 401 (Unauthorized) e redirecionar automaticamente o usuário para a tela de login.

#### 5.2 Módulos de Recurso
Cada recurso (produtos, lojas, categorias e ofertas) possui um módulo dedicado que exporta funções assíncronas padronizadas: get, getById, create, update e delete.

### 6. Autenticação

O AuthContext gerencia o estado global do usuário utilizando a Context API do React. O componente ProtectedRoute atua como um guarda de rotas, verificando a existência do token no localStorage antes de renderizar componentes privados. O processo de logout limpa os dados locais e redireciona o usuário para a interface pública.

### 7. Docker

#### 7.1 Dockerfile (multi-stage)
O processo de containerização utiliza um build em múltiplos estágios. O primeiro estágio (builder) utiliza a imagem node:20-alpine para instalar as dependências e gerar o build de produção. O segundo estágio (production) utiliza a imagem nginx:alpine, copiando os arquivos gerados no diretório /dist e aplicando as configurações customizadas do servidor.

#### 7.2 nginx.conf
Configuração otimizada para Single Page Applications, garantindo que todas as rotas de navegação interna sejam redirecionadas para o index.html. Inclui diretivas de cache para assets estáticos, melhorando o tempo de carregamento para usuários recorrentes.

### 8. CI/CD

O fluxo de integração e entrega contínua é disparado a cada push na branch main. O GitHub Actions executa o build da imagem Docker e realiza o push para o ghcr.io/wittemberg/admin-ofertas-front:latest. Após o upload, um webhook notifica o Portainer para realizar o redeploy automático com as opções Re-pull image e Force redeployment ativas.

### 9. Deploy

A infraestrutura de produção utiliza Docker Swarm para orquestração de containers. O tráfego é gerenciado pelo Traefik, que provê certificados SSL automáticos via Let's Encrypt. A aplicação está acessível através da URL oficial admin-ofertas.wrtec.com.br, com monitoramento via Portainer Enterprise Edition.

---

Documento elaborado em 17 de maio de 2026. As informações contidas são de responsabilidade do solicitante.