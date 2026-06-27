# 07: DTO validation i przyjazne konflikty auth

Data: 2026-06-27

## Kontekst

Po domknięciu minimalnego flow `register → login → token → me` backend nadal przyjmował dowolne payloady HTTP. Brakowało też czytelnego błędu dla sytuacji, gdy email albo username są już zajęte.

Ten krok utwardza istniejący auth bez dodawania nowych funkcji społecznościowych.

## Co zrobiono

- Dodano `class-validator` i `class-transformer`.
- Dodano globalny `ValidationPipe` przez `configureApp`.
- `main.ts` używa wspólnej konfiguracji aplikacji.
- Testy e2e używają tej samej konfiguracji, żeby sprawdzać realne zachowanie HTTP.
- Dodano walidację `RegisterDto`:
  - poprawny email,
  - username 3–30 znaków,
  - username tylko litery/cyfry/underscore,
  - password 8–128 znaków,
  - opcjonalny `displayName` 1–80 znaków.
- Dodano walidację `LoginDto`:
  - poprawny email,
  - password 8–128 znaków.
- `ValidationPipe` ma:
  - `whitelist: true`,
  - `forbidNonWhitelisted: true`,
  - `transform: true`.
- `UsersService.createUser` mapuje błąd Prisma `P2002` na czytelne `409 Conflict`:
  - `Email is already registered`,
  - `Username is already taken`.

## Dlaczego tak?

Walidacja DTO jest pierwszą linią obrony API. Dzięki niej `AuthService` nie musi zgadywać, czy dane wejściowe mają sens — dostaje już payload zgodny z kontraktem.

Obsługa konfliktów w `UsersService` jest blisko miejsca, gdzie występuje błąd bazy danych. Prisma wie, że złamany został unikalny constraint, więc tam mapujemy techniczny błąd na HTTP `409 Conflict`.

## Co zweryfikowano

W `backend/` przechodzą:

```bash
npm run lint
npm run prisma:validate
npm run build
npm test
npm run test:e2e
```

Aktualny wynik:

- unit: 3 test suites, 11 tests,
- e2e: 2 test suites, 10 tests.

Dodatkowo uruchomiono aplikację lokalnie na porcie `3001` i sprawdzono realnie:

- invalid register → `400`,
- valid register → `201`, bez `passwordHash`,
- duplicate register → `409`, `Email is already registered`,
- invalid login → `400`,
- valid login → `201`, zwraca `accessToken`,
- `GET /auth/me` z tokenem → `200`.

Testowy użytkownik smoke został usunięty z bazy.

## Następny krok

Rozstrzygnąć refresh token:

1. przesunąć refresh token do backlogu i zamknąć Milestone 1 jako access-token-only,
2. albo dodać prosty refresh token flow jako osobny, mały krok.

Moja rekomendacja: przesunąć refresh token do backlogu, a przed frontendem dodać jeszcze małe polish tasks: ujednolicone error response i podstawową dokumentację endpointów auth.
