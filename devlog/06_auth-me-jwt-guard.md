# 06: Protected route i JWT guard

Data: 2026-06-27

## Kontekst

Po działającym `register → login → accessToken` brakowało ostatniego elementu minimalnego flow auth: endpointu, który potwierdza, że token faktycznie chroni dostęp do danych użytkownika.

Dodajemy więc mały `GET /auth/me`, bez refresh tokenów i bez ról/uprawnień.

## Co zrobiono

- Dodano `JwtAuthGuard`.
- Guard czyta nagłówek z typem `Bearer` i wartością tokena dostępowego.
- Guard weryfikuje token przez `JwtService.verifyAsync`.
- Po poprawnej weryfikacji zapisuje payload w `request.user`.
- Dodano `AuthService.getCurrentUser`.
- Dodano `GET /auth/me`.
- Endpoint zwraca publicznego użytkownika i nie zwraca `passwordHash`.
- Dodano testy jednostkowe i e2e dla scenariuszy:
  - brak tokena → `401`,
  - niepoprawny token → `401`,
  - poprawny token → publiczny użytkownik.

## Dlaczego prosty guard zamiast Passport Strategy?

Na tym etapie lepszy jest mały, jawny guard, bo:

- łatwiej zobaczyć cały mechanizm JWT,
- nie dokładamy `@nestjs/passport` i strategii Passport zanim są naprawdę potrzebne,
- zachowujemy mały zakres zmiany.

Jeżeli później auth urośnie o OAuth, role albo więcej strategii, możemy przejść na Passport/JwtStrategy.

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

- unit: 3 test suites, 9 tests,
- e2e: 2 test suites, 7 tests.

Dodatkowo uruchomiono aplikację lokalnie na porcie `3001` i sprawdzono realny flow:

- `POST /auth/register` → `201`, bez `passwordHash`,
- `POST /auth/login` → `201`, zwraca `accessToken`, bez `passwordHash`,
- `GET /auth/me` z poprawnym tokenem → `200`, zwraca aktualnego użytkownika,
- `GET /auth/me` bez tokena → `401`,
- `GET /auth/me` z błędnym tokenem → `401`.

Testowy użytkownik smoke został usunięty z bazy po weryfikacji.

## Następny krok

Domknąć auth foundation przez decyzję o refresh tokenie:

1. albo odkładamy refresh token do backlogu i dokumentujemy to,
2. albo dodajemy prosty refresh token flow,
3. potem możemy przejść do walidacji DTO i obsługi konfliktów email/username.
