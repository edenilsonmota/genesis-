# Genesis+

Plataforma para gerenciamento de igrejas, desenvolvida como um monorepo moderno, tipado e preparado para crescer.

O projeto reúne uma aplicação web em React, uma API em NestJS e PostgreSQL, com uma experiência de desenvolvimento padronizada pelo Turborepo e Docker.

## Tecnologias

- React, TypeScript, Vite e Tailwind CSS
- NestJS, TypeORM e Swagger
- PostgreSQL
- Turborepo e pnpm workspaces
- Docker e Docker Compose
- ESLint, Prettier, Jest e Vitest

## Estrutura

```text
genesis+/
├── apps/
│   ├── api/       # API NestJS
│   └── web/       # Aplicação React
├── packages/      # Pacotes compartilhados
├── compose.yaml
└── turbo.json
```

## Documentação

Consulte o [Guia de instalação e uso](docs/GUIA.md) para configurar o ambiente e a
[arquitetura](docs/architecture.md) para conhecer as decisões técnicas do projeto.
# genesis-
