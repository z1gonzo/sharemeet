# Changelog ShareMeet

> Ludzki skrót istotnych zmian. Szczegółowa historia techniczna jest w git log.

## 2026-06-29 — User post list pagination

- Ujednolicono `GET /users/:username/posts` z globalnym feedem przez query params `limit` i `offset`.
- `limit` ma zakres `1..50`, `offset` musi być `>= 0`; błędne query params zwracają `400`.
- `PostsService.findByAuthorId` przyjmuje teraz `{ authorId, limit, offset }`.
- Lista postów użytkownika sortuje po `createdAt desc`, `id desc`.
- Dodano devlog `devlog/13_user-post-list-pagination.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — Global posts feed

- Dodano `ListPostsQueryDto` dla query params `limit` i `offset`.
- Dodano publiczne `GET /posts?limit=20&offset=0`.
- Feed zwraca posty od najnowszych (`createdAt desc`, `id desc`).
- `limit` ma zakres `1..50`, `offset` musi być `>= 0`; błędne query params zwracają `400`.
- Dodano devlog `devlog/12_global-post-feed.md`.
- Nie wykonano pełnego real smoke testu z zapisem do bazy, bo komenda z cleanupem testowego użytkownika została zablokowana przez guard narzędzia; pokrycie zapewniają unit/e2e testy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — User post list

- Dodano `PostsService.findByAuthorId`.
- Dodano publiczne `GET /users/:username/posts`.
- Lista postów użytkownika jest sortowana od najnowszych (`createdAt desc`).
- Dla istniejącego profilu bez postów endpoint zwraca `[]`.
- Dla brakującego profilu endpoint zwraca `404 User profile not found`.
- Dodano devlog `devlog/11_user-post-list.md`.
- Zweryfikowano realny flow `register → login → POST /posts x2 → GET /users/:username/posts` lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Text posts foundation

- Dodano model Prisma `Post` i migrację `20260627160203_add_posts`.
- Dodano `PostsModule`, `PostsService`, `PostsController` i `CreatePostDto`.
- Dodano chronione `POST /posts` i publiczne `GET /posts/:id`.
- Dodano testy jednostkowe i e2e dla tworzenia, walidacji, braku tokena, publicznego odczytu i `404`.
- Dodano devlog `devlog/10_text-posts-foundation.md`.
- Zweryfikowano realny flow `register → login → POST /posts → GET /posts/:id` lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Lightweight profile content policy

- Dodano `docs/profile-content-policy.md`.
- Ustalono, że publiczny `avatarUrl` zostaje i nie blokujemy MVP automatyczną moderacją avatarów.
- Przyszłe reportowanie profilu/avatarów zapisano jako backlog, nie bieżący zakres.
- Rekomendowany późniejszy fallback: report → ręczny review → usunięcie avatara/placeholder.

## 2026-06-27 — Public profile foundation

- Dodano `UsersService.findByUsername`.
- Dodano publiczne `GET /users/:username`.
- Publiczny profil nie zwraca `email`, `passwordHash`, `isActive`, `updatedAt`.
- Zapisano ryzyko moderacji avatarów: `avatarUrl` jest publiczny, ale bez moderacji treści.
- Dodano devlog `devlog/09_public-profile.md`.
- Zweryfikowano realny flow `register → login → PATCH /users/me → GET /users/:username` lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — User profile foundation

- Refresh token i Google OAuth przesunięto do backlogu.
- Dodano `docs/auth-api.md`.
- Wydzielono `JwtAccessModule` i przeniesiono `JwtAuthGuard` do `common/guards`.
- Dodano `UpdateProfileDto`, `UsersController`, `UsersService.updateProfile` i chronione `PATCH /users/me`.
- Dodano testy jednostkowe i e2e profilu.
- Zweryfikowano realny flow `register → login → PATCH /users/me → GET /auth/me` lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Auth validation/conflicts foundation

- Dodano `class-validator` i `class-transformer`.
- Dodano wspólną konfigurację `configureApp` z globalnym `ValidationPipe`.
- Dodano walidację `RegisterDto` i `LoginDto`.
- Dodano przyjazne `409 Conflict` dla zajętego emaila albo username.
- Dodano devlog `devlog/07_auth-validation-conflicts.md` i ADR w `docs/decisions.md`.
- Zweryfikowano realnie invalid register/login, duplicate register oraz flow register/login/me lokalnie na porcie `3001`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Auth me/JWT guard foundation

- Dodano `JwtAuthGuard`.
- Dodano chronione `GET /auth/me`.
- Dodano `AuthService.getCurrentUser`.
- Dodano testy jednostkowe i e2e dla braku tokena, błędnego tokena i poprawnego tokena.
- Zweryfikowano realny flow `register → login → me` lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Auth login/JWT foundation

- Dodano `@nestjs/jwt`.
- Dodano `LoginDto`, `AuthService.login` i `POST /auth/login`.
- Login porównuje hasło z `passwordHash` i zwraca JWT access token oraz publicznego użytkownika bez `passwordHash`.
- Dodano testy jednostkowe i e2e dla poprawnego i błędnego loginu.
- Zweryfikowano realny endpoint lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy po sprawdzeniu.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Auth register foundation

- Dodano `AuthModule`, `AuthService`, `AuthController` i `RegisterDto`.
- Dodano `POST /auth/register`.
- Dodano `bcryptjs` do hashowania haseł.
- Dodano test jednostkowy dla `AuthService.register` i test e2e dla `POST /auth/register`.
- Zweryfikowano realny endpoint lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy po sprawdzeniu.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — UsersService foundation

- Dodano minimalny `UsersModule` i `UsersService` korzystający z `PrismaService`.
- Dodano `CreateUserDto`.
- Dodano testy `UsersService` dla `createUser`, `findByEmail` i `findById`.
- Podłączono `UsersModule` do `AppModule`.
- Dodano devlog `devlog/03_users-service.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Prisma/User foundation

- Dodano Prisma 6 (`prisma`, `@prisma/client`) jako data access layer dla PostgreSQL.
- Dodano `backend/prisma/schema.prisma` z modelem `User`.
- Utworzono i zastosowano migrację `init_user` dla tabeli `users`.
- Dodano `PrismaModule` i `PrismaService`.
- Zmieniono port hosta PostgreSQL na `5433`, żeby uniknąć konfliktu z istniejącą lokalną bazą na `5432`.
- Dodano devlog `devlog/02_prisma-user-foundation.md`.
- Zweryfikowano `backend`: `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — reset auth/users

- Usunięto eksperymentalną implementację `backend/src/auth/` i `backend/src/users/`.
- Uproszczono `backend/src/app.module.ts` do czystego szkieletu NestJS.
- Usunięto tymczasowe zależności Passport/JWT/Google OAuth z `backend/package.json`.
- Potwierdzono decyzję: users/auth odbudowujemy od zera na PostgreSQL + Prisma.
- Zweryfikowano `backend`: `npm install`, `npm run format`, `npm run build`, `npm test` i `npm run test:e2e` przechodzą.

## 2026-06-22

- Dodano standard workflow AI: `AGENTS.md`, `plan.md`, `project_state.md`.
- Dodano `docs/architecture.md` i `docs/decisions.md`.
- Uporządkowano `README.md` jako krótki entrypoint zamiast miejsca na cały plan.
- Ustalono, że devlog zostaje w głównym repo jako `devlog/`.
- Osobny pusty projekt `sharemeet-devlog` zarchiwizowano poza aktywnym workspace: `<local-archive>/sharemeet-devlog_20260622_232457`.
- Dodano `.gitignore` i `.prettierrc`.
- Zainicjalizowano lokalne repo git dla `sharemeet/`.
- Zweryfikowano, że backend obecnie nie buduje się przez błędy auth/users i brakujące/rozjechane zależności.

## 2026-06-14

- Udokumentowano decyzję PostgreSQL + MongoDB w `devlog/01_db-choice.md`.
