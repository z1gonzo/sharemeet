# ShareMeet Backend

NestJS backend for the ShareMeet educational social-platform project.

## Current status

The backend is build-green after resetting the experimental auth/users code.

Current foundation:

- clean NestJS skeleton,
- PostgreSQL configured through Docker Compose on host port `5433`,
- Prisma 6 configured as the data access layer,
- first `User` model and migration exist,
- auth/users endpoints are not rebuilt yet.

Before adding new features, read:

- `../project_state.md`
- `../plan.md`
- `../docs/architecture.md`
- `../docs/decisions.md`

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

Expected current result: passes.

## Development server

```bash
npm run start:dev
```

Run this only after the build blocker is resolved or while actively debugging it.

## Tests

```bash
npm test
npm run test:e2e
```

Current smoke tests pass.

## Prisma

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate -- --name <migration-name>
```

Local `DATABASE_URL` should point at PostgreSQL from `../db/docker-compose.yml`:

```text
postgresql://sharemeet:<local-password>@localhost:5433/sharemeet_db?schema=public
```

## Next coding task

1. Rebuild a minimal `UsersModule` using `PrismaService`.
2. Add one public behavior test for user creation or lookup.
3. Then add `AuthModule` with email/password register/login and JWT access token.
