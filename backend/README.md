# ShareMeet Backend

NestJS backend for the ShareMeet educational social-platform project.

## Current status

The backend is build-green after resetting the experimental auth/users code.

Current foundation:

- clean NestJS skeleton,
- PostgreSQL configured through Docker Compose on host port `5433`,
- Prisma 6 configured as the data access layer,
- first `User` model and migration exist,
- `UsersService` currently provides `createUser`, `findByEmail`, `findById`, `findByUsername` and `updateProfile`.
- `AuthModule` currently provides `POST /auth/register`, `POST /auth/login` and `GET /auth/me`.
- `UsersModule` currently provides public `GET /users/:username`, public paginated `GET /users/:username/posts?limit=20&offset=0`, protected `PATCH /users/me`, protected follow/unfollow, and public followers/following lists.
- `PostsModule` currently provides protected `POST /posts`, protected own-post `PATCH /posts/:id` and `DELETE /posts/:id`, public global feed `GET /posts?limit=20&offset=0` and public `GET /posts/:id`.
- Register/login/profile/post DTOs are validated through a global `ValidationPipe`.
- Duplicate email/username returns friendly `409 Conflict` responses.
- Login returns a JWT access token.
- `GET /auth/me` is protected by `JwtAuthGuard`.

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

1. Add following feed (`GET /posts/following`) or follower/following counts as the next social MVP slice.
2. Keep profile/avatar reporting as backlog unless abuse becomes a real concern.
3. Keep `npm run lint && npm run build && npm test && npm run test:e2e` green.
