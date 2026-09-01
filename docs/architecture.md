# Arquitetura do Genesis+

## Decisões iniciais

O Genesis+ é um monorepo pnpm/Turborepo com React, Vite e Tailwind CSS no frontend, NestJS no backend e PostgreSQL via TypeORM. A API usa UUIDs, rotas versionadas em `/api/v1`, DTOs validados e JWT Bearer de curta duração. Não há cadastro público nem refresh token nesta etapa. O logout consiste em remover o token no cliente; revogação e refresh tokens serão avaliados quando houver requisitos de sessão.

Migrations versionadas são a fonte de verdade do banco. O `synchronize` permanece desabilitado em todos os ambientes.

## Frontend

A organização será por funcionalidade, criada apenas quando cada funcionalidade existir:

```text
src/
├── app/                 # bootstrap, providers e roteamento
├── features/
│   └── auth/            # páginas, componentes, hooks, schemas e API locais
├── components/          # componentes compartilhados por duas ou mais features
├── layouts/             # estruturas de página reutilizáveis
├── lib/                 # cliente HTTP e utilitários sem regra de domínio
├── types/               # contratos realmente compartilhados
└── main.tsx
```

Componentes começam dentro da feature e só migram para `components` quando usados por pelo menos duas features. Nomes de componentes e páginas usam PascalCase, hooks começam com `use`, e demais módulos usam camelCase. Não serão criados arquivos que apenas repassem uma chamada.

A autenticação ficará em um provider/hook da feature `auth`; o token será mantido inicialmente em memória (persistência será decidida junto da experiência de sessão). O cliente HTTP central traduzirá o formato de erro da API e reagirá a `401`; erros de campo ficam próximos ao formulário. Rotas protegidas exigirão autenticação e, futuramente, permissões efetivas. A interface poderá ocultar ações sem permissão, mas o backend continuará sendo a autoridade.

## Backend

Cada domínio (`auth`, `users`, `members`, `roles` e os futuros `churches` e `permissions`) possui módulo próprio. Controllers tratam HTTP e Swagger; services contêm regras de negócio; DTOs validam entrada; entities descrevem persistência. Repositórios TypeORM são injetados diretamente, salvo quando uma abstração trouxer comportamento concreto.

Fluxo: requisição HTTP → `ValidationPipe` global → guard JWT, quando privado → controller → service → repository TypeORM → resposta. Exceções padrão do NestJS produzem respostas HTTP consistentes; um filtro global só será adicionado quando houver um formato de erro específico a padronizar. Segredos e tempos de expiração vêm do ambiente e são validados no bootstrap.

Controllers usam substantivos no plural sob `/api/v1`; ações que não forem CRUD devem permanecer explícitas e pequenas. O Swagger fica em `/docs`, fora do prefixo, e aceita Bearer Token.

Testes unitários cobrem regras de autenticação e o bootstrap do administrador sem banco. Testes de integração futuros usarão um PostgreSQL isolado para constraints, migrations e endpoints completos. Casos críticos de autorização receberão testes e2e.

## Usuário, membro e permissões

`users` representa credenciais; `members` representa a pessoa no cadastro da igreja. A FK opcional `members.user_id` tem `UNIQUE`, portanto um usuário pode estar vinculado a no máximo um membro e um membro a no máximo um usuário. Vincular exigirá ambos ativos, compatibilidade com o contexto da igreja e transação; desvincular define a FK como nula, sem apagar qualquer registro. Nome e contato de membro não serão copiados automaticamente para usuário, evitando duas fontes de verdade.

O papel `admin` é global e fixo, associado por `user_global_roles`, logo continua válido mesmo após o vínculo com membro. Os demais papéis serão atribuídos no futuro no contexto da igreja pela associação `(user_id, church_id, role_id)`, e suas permissões serão a união dos papéis daquele contexto. O cliente informará a igreja da operação pela rota ou por um contexto explícito a definir; login não exige escolher igreja.

A entidade `Member` contém apenas a base necessária ao vínculo nesta etapa. `church_id` será convertido em relação TypeORM quando o módulo de igrejas for implementado.

## Decisões específicas da stack

- Services NestJS recebem os repositórios do TypeORM diretamente quando precisam persistir entidades.
- Papéis e permissões são entidades do próprio domínio.
- O administrador recebe papel global, separado dos futuros papéis por igreja.
- Identificadores usam UUID em vez de bigint.
- Refresh/logout server-side foram adiados para evitar estado de sessão sem requisito de revogação definido.
