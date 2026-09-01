# Guia de instalação e uso

O Genesis+ é executado integralmente em containers Docker. Não é necessário instalar Node.js ou pnpm na máquina hospedeira.

## Execução com Docker

### Requisito

- Docker com Docker Compose

### Instalação

Na raiz do projeto, crie o arquivo de configuração do ambiente:

```bash
cp .env.example .env
```

Construa as imagens e inicie todos os serviços em segundo plano:

```bash
docker compose up -d --build
```

Na primeira execução após uma alteração nas dependências, o pnpm pode atualizar
automaticamente os volumes de `node_modules` dos containers. O Compose define o
ambiente não interativo necessário para essa atualização.

Prepare o banco e crie o administrador inicial:

```bash
docker compose exec api pnpm --filter @genesis-plus/api migration:run
docker compose exec api pnpm --filter @genesis-plus/api geography:sync
docker compose exec api pnpm --filter @genesis-plus/api admin:bootstrap
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

## Endereços expostos pelos containers

| Serviço       | Endereço                     |
| ------------- | ---------------------------- |
| Aplicação web | http://localhost:5173        |
| API           | http://localhost:3000/api/v1 |
| Health check  | http://localhost:3000/health |
| Swagger       | http://localhost:3000/docs   |
| PostgreSQL    | localhost:5432               |

## Variáveis de ambiente

As configurações gerais do Docker ficam no arquivo `.env`, criado a partir de `.env.example`.

| Variável            | Valor padrão                   | Descrição                                                           |
| ------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `POSTGRES_DB`       | `genesis_plus`                 | Nome do banco                                                       |
| `POSTGRES_USER`     | `genesis`                      | Usuário do banco                                                    |
| `POSTGRES_PASSWORD` | `genesis`                      | Senha do banco no ambiente Docker                                   |
| `POSTGRES_PORT`     | `5432`                         | Porta exposta do PostgreSQL                                         |
| `API_PORT`          | `3000`                         | Porta exposta da API                                                |
| `WEB_PORT`          | `5173`                         | Porta exposta do frontend                                           |
| `WEB_ORIGIN`        | `http://localhost:5173`        | Origem permitida pelo CORS                                          |
| `VITE_API_URL`      | `http://localhost:3000/api/v1` | API utilizada pelo navegador                                        |
| `JWT_SECRET`        | sem padrão                     | Segredo aleatório com no mínimo 32 caracteres                       |
| `JWT_EXPIRES_IN`    | `15m`                          | Expiração do access token                                           |
| `DEFAULT_ADMIN_*`   | sem padrão seguro              | Nome, e-mail e senha (mínimo 8 caracteres) do administrador inicial |

Não versione arquivos `.env` ou credenciais reais.

## Comandos de desenvolvimento

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose logs -f api
docker compose exec api pnpm --filter @genesis-plus/api migration:run
docker compose exec api pnpm --filter @genesis-plus/api geography:sync
docker compose exec api pnpm --filter @genesis-plus/api admin:bootstrap
docker compose exec api pnpm --filter @genesis-plus/api test
docker compose exec api pnpm --filter @genesis-plus/api lint
docker compose exec api pnpm --filter @genesis-plus/api typecheck
docker compose exec web pnpm --filter @genesis-plus/web test
docker compose exec web pnpm --filter @genesis-plus/web lint
docker compose exec web pnpm --filter @genesis-plus/web typecheck
docker compose down
```

## Banco de dados

A API utiliza TypeORM com migrations versionadas e `synchronize` desabilitado em todos os ambientes. Execute as migrations e então o bootstrap do administrador.

## Autenticação

- `POST /api/v1/auth/login` recebe `email` e `password`.
- `GET /api/v1/auth/me` exige `Authorization: Bearer <token>`.

Não há cadastro público, refresh token ou blacklist de logout nesta etapa. Para sair, o cliente descarta o access token.

O esquema do banco deve ser alterado exclusivamente por migrations versionadas.

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

Dentro da rede do Compose, o hostname do banco deve ser `postgres`.

### Recriar o ambiente Docker

```bash
docker compose down
docker compose up -d --build
```

Para recriar também o banco vazio, adicione `--volumes` ao comando `down`.
