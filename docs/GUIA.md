# Guia de instalação e uso

Este guia apresenta duas formas de executar o Genesis+: completamente em containers ou com Node.js local e apenas o PostgreSQL no Docker.

## Opção recomendada: tudo no Docker

### Requisito

- Docker com Docker Compose

### Instalação

Na raiz do projeto, crie o arquivo de configuração local:

```bash
cp .env.example .env
```

Construa as imagens e inicie todos os serviços:

```bash
docker compose up --build
```

Para executar em segundo plano:

```bash
docker compose up -d --build
```

O código-fonte é montado nos containers. Alterações no React e no NestJS são recarregadas automaticamente durante o desenvolvimento.

### Operação dos containers

```bash
docker compose ps           # mostra o estado dos serviços
docker compose logs -f      # acompanha todos os logs
docker compose logs -f api  # acompanha somente a API
docker compose down         # encerra os serviços
```

Para encerrar os serviços e apagar também os dados locais do PostgreSQL:

```bash
docker compose down --volumes
```

> Esse último comando remove o volume do banco e seus dados. Use-o apenas quando quiser recriar o banco do zero.

## Alternativa: Node.js local

Esta opção executa React e NestJS diretamente na máquina e mantém somente o PostgreSQL no Docker.

### Requisitos

- Node.js 22 ou superior
- pnpm 11 ou superior
- Docker com Docker Compose

### Instalação

```bash
corepack enable
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm db:up
pnpm dev
```

## Endereços locais

| Serviço | Endereço |
| --- | --- |
| Aplicação web | http://localhost:5173 |
| API | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |
| Swagger | http://localhost:3000/docs |
| PostgreSQL | localhost:5432 |

## Variáveis de ambiente

As configurações gerais do Docker ficam no arquivo `.env`, criado a partir de `.env.example`.

| Variável | Valor padrão | Descrição |
| --- | --- | --- |
| `POSTGRES_DB` | `genesis_plus` | Nome do banco |
| `POSTGRES_USER` | `genesis` | Usuário do banco |
| `POSTGRES_PASSWORD` | `genesis` | Senha local do banco |
| `POSTGRES_PORT` | `5432` | Porta exposta do PostgreSQL |
| `API_PORT` | `3000` | Porta exposta da API |
| `WEB_PORT` | `5173` | Porta exposta do frontend |
| `WEB_ORIGIN` | `http://localhost:5173` | Origem permitida pelo CORS |
| `VITE_API_URL` | `http://localhost:3000/api` | API utilizada pelo navegador |

Não versione arquivos `.env` ou credenciais reais.

## Comandos de desenvolvimento local

```bash
pnpm dev           # inicia web e API com hot reload
pnpm build         # gera o build de todos os aplicativos
pnpm lint          # executa o ESLint
pnpm test          # executa os testes
pnpm typecheck     # verifica os tipos TypeScript
pnpm format        # formata os arquivos com Prettier
pnpm format:check  # verifica a formatação sem alterar arquivos
pnpm db:up         # inicia somente o PostgreSQL
pnpm db:logs       # acompanha os logs do PostgreSQL
pnpm db:down       # encerra os serviços do Compose
```

## Banco de dados

A API utiliza TypeORM. No ambiente de desenvolvimento, `synchronize` está habilitado para facilitar a criação inicial das tabelas.

Em produção, desabilite a sincronização automática e utilize migrations versionadas. Nunca use `synchronize: true` como estratégia de atualização de um banco de produção.

## Problemas comuns

### Uma porta já está em uso

Altere a porta correspondente no arquivo `.env`. Por exemplo:

```env
API_PORT=3001
WEB_PORT=5174
POSTGRES_PORT=5433
```

Ao alterar `API_PORT` ou `WEB_PORT`, ajuste também `VITE_API_URL` e `WEB_ORIGIN`.

### A API não conecta ao banco

Confira o estado e os logs:

```bash
docker compose ps
docker compose logs postgres api
```

No Docker, o hostname do banco deve ser `postgres`. Na execução local, deve ser `localhost`.

### Recriar o ambiente Docker

```bash
docker compose down
docker compose up -d --build
```

Para recriar também o banco vazio, adicione `--volumes` ao comando `down`.
