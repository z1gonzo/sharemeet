# Changelog ShareMeet

> Ludzki skrót istotnych zmian. Szczegółowa historia techniczna jest w git log.

## 2026-06-27

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
