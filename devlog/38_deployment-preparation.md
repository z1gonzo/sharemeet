# 38: Deployment preparation

Data: 2026-07-04

## Zmiana

Przygotowano ShareMeet pod pierwszy publiczny deployment/demo bez faktycznego wdrażania na hosting.

Dodano dokument:

```text
docs/deployment.md
```

Opisuje rekomendowaną ścieżkę:

- frontend: Vercel,
- backend: Render Web Service,
- baza: Neon lub Supabase Postgres.

## Zmiany techniczne

Backend:

- `build` uruchamia teraz `prisma generate && nest build`, żeby hosting miał wygenerowany Prisma Client.
- Dodano `prisma:migrate:deploy` dla środowisk deploymentowych.
- Naprawiono `start:prod` na faktyczny output Nest build: `node dist/src/main.js`.
- CORS wspiera `FRONTEND_URL` i opcjonalne `CORS_ORIGINS`.
- `.env.example` opisuje `PORT`, `FRONTEND_URL` i `CORS_ORIGINS`.

Frontend:

- Dodano `frontend/.env.example` z `VITE_API_URL`.

## Dlaczego

Do publicznego demo potrzebujemy rozdzielić:

- Vite frontend,
- NestJS backend,
- managed PostgreSQL.

Najważniejsze blocker-prevention przed deployem:

- poprawny production start command,
- poprawny API base URL na froncie,
- poprawny CORS backendu,
- migracje Prisma dla zdalnej bazy,
- deterministyczny demo seed.

## Weryfikacja

Do wykonania po zmianie:

```bash
cd backend
npm run prisma:validate
npm run build
npm run start:prod

cd ../frontend
npm run build
```

## Następne kroki

- Wybrać konkretny hosting pair: Vercel + Render + Neon/Supabase.
- Utworzyć managed Postgres.
- Skonfigurować env vars.
- Wykonać pierwszy deploy i browser smoke test.
