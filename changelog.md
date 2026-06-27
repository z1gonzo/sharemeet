# Changelog ShareMeet

> Ludzki skrót istotnych zmian. Szczegółowa historia techniczna jest w git log.

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
