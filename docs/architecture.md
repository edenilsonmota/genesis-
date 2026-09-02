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

### Responsividade

Todas as telas e componentes devem possuir visualização adequada para dispositivos móveis desde sua implementação. Formulários, filtros, menus, tabelas e ações devem reorganizar-se em larguras reduzidas sem perda de funcionalidade. Tabelas extensas podem usar rolagem horizontal acompanhada de largura mínima legível; ações essenciais não podem depender apenas de hover. A validação de uma funcionalidade inclui conferir os layouts mobile e desktop.

### Design system e padrões de interface

Novas features devem reutilizar os componentes de `src/components/ui`. Não se deve copiar combinações de classes Tailwind para recriar um padrão já existente. Se uma necessidade recorrente ainda não estiver coberta, o componente compartilhado deve ser ampliado antes de criar uma variação local.

- `PageHeader`: título, descrição curta e uma ação principal opcional. Deve iniciar todas as páginas administrativas.
- `FeatureTabs`: padrão oficial para subabas dentro da mesma página. Usa linha inferior, verde na opção ativa, rolagem horizontal no mobile e semântica acessível de tabs. Subabas representam partes relacionadas de uma feature; não devem criar uma nova entrada no menu principal.
- `FilterPanel`: painel branco com borda, sombra leve, espaçamento uniforme e grade responsiva. A ordem padrão é busca textual, filtros de escopo, situação e período. Alterar qualquer filtro retorna a paginação à primeira página. Filtros combináveis são enviados juntos ao backend.
- `controlClass`: aparência única de `input`, `select` e `textarea`, com altura mínima, borda cinza e foco verde. `SearchableSelect` continua obrigatório para listas não triviais.
- `Pagination`: sempre abaixo da listagem, mostrando total, página atual, total de páginas e botões Anterior/Próxima. A paginação de dados deve ser feita no backend.
- `StatusBadge`: situação ativa em verde e inativa em cinza. Situações de alerta ou erro poderão ganhar variantes semânticas no componente.

#### Cores e botões

Todos os botões usam o componente `Button`, altura mínima de toque, foco visível e estado desabilitado consistente. As variantes são semânticas e não devem ser escolhidas apenas por preferência visual:

| Variante | Uso | Aparência |
| --- | --- | --- |
| `primary` | Criar, salvar, confirmar e ação principal da página | Fundo verde escuro e texto branco |
| `secondary` | Cancelar, voltar, paginação e ações neutras | Fundo branco e borda cinza |
| `view` | Visualizar detalhes | Azul claro |
| `edit` | Editar dados existentes | Âmbar claro |
| `danger` | Excluir, remover acesso, inativar ou ação destrutiva | Vermelho claro |
| `ghost` | Ação auxiliar de baixa ênfase | Fundo transparente e texto cinza |

Uma área de ações deve seguir a ordem `Visualizar → Editar → Excluir/Inativar`. Ações destrutivas exigem confirmação explícita e mensagem que identifique o efeito. Botões indisponíveis permanecem desabilitados com explicação; não devem apenas desaparecer quando isso prejudicar a compreensão do fluxo. Uma página deve possuir no máximo uma ação `primary` em destaque por contexto.

#### Paleta e superfícies

Verde-esmeralda é a cor institucional e de ação principal; azul comunica consulta; âmbar comunica alteração; vermelho comunica risco; cinza-ardósia é usado em texto, bordas, estados neutros e ações secundárias. Páginas usam fundo `slate-100`, cartões usam branco com `rounded-xl`, borda discreta ou `shadow-sm`, títulos usam `font-display` e textos auxiliares usam `text-slate-500`. Cores semânticas não devem ser trocadas entre features.

### Navegação e permissões

O menu principal é superior e orientado pelo catálogo tipado `navigationCatalog`. A hierarquia é Categoria → Item → Recurso → Ações. Categorias agrupam funcionalidades; itens possuem identificador e rota estáveis; cada recurso declara as permissões `view`, `create`, `update` e `delete` no formato `recurso.ação`.

Exemplo: a categoria `organization` apresenta o item único “Áreas e igrejas”, reunindo os dois cadastros relacionados na mesma página por meio das subabas `Áreas` e `Igrejas`. Somente o conteúdo da subaba ativa é exibido. A união é apenas visual: os recursos continuam independentes e mantêm `areas.view/create/update/delete` e `churches.view/create/update/delete`. O item aparece quando o usuário pode visualizar pelo menos um dos recursos, enquanto cada formulário e ação consulta sua permissão específica. O administrador global ignora essas restrições.

O catálogo do frontend organiza a experiência, mas não concede acesso. O backend é a autoridade e protege cada operação. A matriz de cargos é alimentada pelo catálogo de módulos da API, com chaves estáveis, e oferece os níveis sem acesso, leitura e leitura/escrita sem atrelar autorização a rótulos visuais.

A autenticação ficará em um provider/hook da feature `auth`; o token será mantido inicialmente em memória (persistência será decidida junto da experiência de sessão). O cliente HTTP central traduzirá o formato de erro da API e reagirá a `401`; erros de campo ficam próximos ao formulário. Rotas protegidas exigirão autenticação e, futuramente, permissões efetivas. A interface poderá ocultar ações sem permissão, mas o backend continuará sendo a autoridade.

## Backend

Cada domínio (`auth`, `users`, `members`, `roles`, `churches`, `permissions` e `user-groups`) possui módulo próprio. Controllers tratam HTTP e Swagger; services contêm regras de negócio; DTOs validam entrada; entities descrevem persistência. Repositórios TypeORM são injetados diretamente, salvo quando uma abstração trouxer comportamento concreto.

Fluxo: requisição HTTP → `ValidationPipe` global → guard JWT, quando privado → controller → service → repository TypeORM → resposta. Exceções padrão do NestJS produzem respostas HTTP consistentes; um filtro global só será adicionado quando houver um formato de erro específico a padronizar. Segredos e tempos de expiração vêm do ambiente e são validados no bootstrap.

Controllers usam substantivos no plural sob `/api/v1`; ações que não forem CRUD devem permanecer explícitas e pequenas. O Swagger fica em `/docs`, fora do prefixo, e aceita Bearer Token.

Testes unitários cobrem regras de autenticação e o bootstrap do administrador sem banco. Testes de integração futuros usarão um PostgreSQL isolado para constraints, migrations e endpoints completos. Casos críticos de autorização receberão testes e2e.

### Auditoria

Toda operação HTTP de criação, alteração, inativação ou exclusão (`POST`, `PUT`, `PATCH` e `DELETE`) concluída com sucesso passa pelo interceptor global de auditoria. O registro contém data e hora do servidor, usuário autenticado, ação, recurso, rota, identificador do registro, endereço IP e contexto da requisição. Senhas, hashes, tokens, segredos e cabeçalhos de autorização são sempre substituídos por `[REDACTED]` e nunca persistidos.

Os registros de `audit_logs` são históricos e não possuem endpoints de alteração ou exclusão. A consulta administrativa oferece busca, filtros por usuário, ação, recurso e período, além de paginação no backend. Processos executados fora de uma requisição autenticada podem registrar o ator como sistema quando forem integrados explicitamente ao serviço de auditoria.

## Usuário, membro e permissões

`users` representa credenciais; `members` representa a pessoa no cadastro da igreja. A FK opcional `members.user_id` tem `UNIQUE`, portanto um usuário pode estar vinculado a no máximo um membro e um membro a no máximo um usuário. Vincular exigirá ambos ativos, compatibilidade com o contexto da igreja e transação; desvincular define a FK como nula, sem apagar qualquer registro. Nome e contato de membro não serão copiados automaticamente para usuário, evitando duas fontes de verdade.

O papel `admin` é global e fixo, associado por `user_global_roles`, logo continua válido mesmo após o vínculo com membro. Os demais cargos pertencem a uma Área e são atribuídos no contexto de uma Igreja pela associação `(user_id, church_id, role_id)`. Um cargo só pode ser vinculado a igrejas de sua própria Área. As permissões usam os níveis `read` e `write`; ausência de registro significa sem acesso. O login não exige escolher igreja.

A tela “Grupos de usuários” é a interface administrativa dos usuários com acesso e dos cargos; “grupo” não é uma entidade duplicada. Conceder acesso parte obrigatoriamente de um membro existente, cria ou reutiliza sua credencial e grava igreja e cargos em uma única transação. Para uma nova credencial, o CPF normalizado é a senha inicial, armazenada apenas como hash, e `must_change_password` obriga sua substituição no primeiro acesso. Enquanto essa troca estiver pendente, o guard permite somente o endpoint de alteração da senha.

A entidade `Member` contém a base necessária ao vínculo com usuário. A participação em igrejas é derivada dos vínculos de cargo; `church_id` permanece apenas como referência primária opcional para compatibilidade com os registros existentes.

O módulo de membros mantém dados pessoais normalizados (CPF, contato, nascimento, sexo e endereço) separados das credenciais. Um membro pode existir sem usuário; ao receber o primeiro cargo, a criação do usuário e dos vínculos ocorre na mesma transação. Os vínculos guardam situação e datas inicial/final para permitir histórico. Exclusão física é recusada quando há usuário ou igreja de referência; nesses casos utiliza-se inativação.

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
