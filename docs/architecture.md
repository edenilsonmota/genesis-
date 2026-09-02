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

Selects com listas não triviais devem oferecer pesquisa e navegação acessível por teclado por meio do componente compartilhado `SearchableSelect`, baseado no Combobox do Headless UI e estilizado com Tailwind CSS. Selects pequenos e fixos, como um estado binário, podem permanecer nativos.

### Navegação e permissões

O menu principal é superior e orientado pelo catálogo tipado `navigationCatalog`. A hierarquia é Categoria → Item → Recurso → Ações. Categorias agrupam funcionalidades; itens possuem identificador e rota estáveis; cada recurso declara as permissões `view`, `create`, `update` e `delete` no formato `recurso.ação`.

Exemplo: a categoria `organization` contém os itens `areas` e `churches`; o item `areas` mapeia `areas.view`, `areas.create`, `areas.update` e `areas.delete`. O menu exibe apenas itens com permissão `view`, as rotas devem aplicar a mesma regra e os controles de ação consultam a permissão correspondente. O administrador global ignora essas restrições.

O catálogo do frontend organiza a experiência, mas não concede acesso. O backend é a autoridade e protege cada operação. A matriz de cargos é alimentada pelo catálogo de módulos da API, com chaves estáveis, e oferece os níveis sem acesso, leitura e leitura/escrita sem atrelar autorização a rótulos visuais.

A autenticação ficará em um provider/hook da feature `auth`; o token será mantido inicialmente em memória (persistência será decidida junto da experiência de sessão). O cliente HTTP central traduzirá o formato de erro da API e reagirá a `401`; erros de campo ficam próximos ao formulário. Rotas protegidas exigirão autenticação e, futuramente, permissões efetivas. A interface poderá ocultar ações sem permissão, mas o backend continuará sendo a autoridade.

## Backend

Cada domínio (`auth`, `users`, `members`, `roles`, `churches`, `permissions` e `user-groups`) possui módulo próprio. Controllers tratam HTTP e Swagger; services contêm regras de negócio; DTOs validam entrada; entities descrevem persistência. Repositórios TypeORM são injetados diretamente, salvo quando uma abstração trouxer comportamento concreto.

Fluxo: requisição HTTP → `ValidationPipe` global → guard JWT, quando privado → controller → service → repository TypeORM → resposta. Exceções padrão do NestJS produzem respostas HTTP consistentes; um filtro global só será adicionado quando houver um formato de erro específico a padronizar. Segredos e tempos de expiração vêm do ambiente e são validados no bootstrap.

Controllers usam substantivos no plural sob `/api/v1`; ações que não forem CRUD devem permanecer explícitas e pequenas. O Swagger fica em `/docs`, fora do prefixo, e aceita Bearer Token.

Testes unitários cobrem regras de autenticação e o bootstrap do administrador sem banco. Testes de integração futuros usarão um PostgreSQL isolado para constraints, migrations e endpoints completos. Casos críticos de autorização receberão testes e2e.

## Usuário, membro e permissões

`users` representa credenciais; `members` representa a pessoa no cadastro da igreja. A FK opcional `members.user_id` tem `UNIQUE`, portanto um usuário pode estar vinculado a no máximo um membro e um membro a no máximo um usuário. Vincular exigirá ambos ativos, compatibilidade com o contexto da igreja e transação; desvincular define a FK como nula, sem apagar qualquer registro. Nome e contato de membro não serão copiados automaticamente para usuário, evitando duas fontes de verdade.

O papel `admin` é global e fixo, associado por `user_global_roles`, logo continua válido mesmo após o vínculo com membro. Os demais cargos pertencem a uma Área e são atribuídos no contexto de uma Igreja pela associação `(user_id, church_id, role_id)`. Um cargo só pode ser vinculado a igrejas de sua própria Área. As permissões usam os níveis `read` e `write`; ausência de registro significa sem acesso. O login não exige escolher igreja.

A tela “Grupos de usuários” é a interface administrativa dos usuários com acesso e dos cargos; “grupo” não é uma entidade duplicada. Conceder acesso parte obrigatoriamente de um membro existente, cria ou reutiliza sua credencial e grava igreja e cargos em uma única transação. Para uma nova credencial, o CPF normalizado é a senha inicial, armazenada apenas como hash, e `must_change_password` obriga sua substituição no primeiro acesso. Enquanto essa troca estiver pendente, o guard permite somente o endpoint de alteração da senha.

A entidade `Member` contém a base necessária ao vínculo com usuário e pertence obrigatoriamente a uma Igreja.

## Áreas e igrejas

Estados e cidades são referências locais identificadas pelos códigos oficiais do IBGE. Áreas definem nome e `city_id`; a UF é derivada da cidade. Igrejas pertencem obrigatoriamente a uma Área e armazenam nome, CEP, rua, bairro, número, complemento e status. Rua e bairro são obtidos pelo backend no ViaCEP; o código IBGE do município retornado precisa coincidir com a cidade da Área. Número e complemento são informados pelo administrador. Nomes de Área são únicos sem diferenciar maiúsculas e minúsculas, assim como nomes de Igreja dentro de cada Área.

A lista de usuários de uma Igreja é derivada dos vínculos ativos de cargos por Igreja. Ela não é armazenada diretamente na entidade `Church`.

Departamentos pertencem à Igreja e mantêm identidade própria, evitando cargos artificiais como “Coordenador Infantil”. O vínculo de acesso pode informar um departamento opcional, formando `Membro → Usuário → Igreja → Cargo → Departamento`. Assim, o mesmo cargo pode ser usado em departamentos diferentes; cargos gerais permanecem com departamento nulo. Índices parciais impedem a repetição da mesma combinação tanto nos vínculos gerais quanto nos departamentais.

## Decisões específicas da stack

- Services NestJS recebem os repositórios do TypeORM diretamente quando precisam persistir entidades.
- Papéis e permissões são entidades do próprio domínio.
- O administrador recebe papel global, separado dos futuros papéis por igreja.
- Identificadores usam UUID em vez de bigint.
- Refresh/logout server-side foram adiados para evitar estado de sessão sem requisito de revogação definido.
