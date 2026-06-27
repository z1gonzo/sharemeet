# 05: Login z JWT access token

Data: 2026-06-27

## Kontekst

Po działającym `POST /auth/register` następnym małym krokiem jest login. Na tym etapie dodajemy tylko access token. Refresh token i JWT guard/protected route zostają na kolejne kroki.

## Co zrobiono

- Dodano `@nestjs/jwt`.
- Dodano `LoginDto`.
- Rozszerzono `AuthService` o `login`.
- `login` wyszukuje użytkownika po emailu przez `UsersService.findByEmail`.
- Hasło jest porównywane przez `bcryptjs.compare` z `passwordHash`.
- Dla poprawnych danych zwracany jest `accessToken` i publiczny `user` bez `passwordHash`.
- Dla błędnych danych zwracany jest `UnauthorizedException`.
- Dodano `POST /auth/login`.
- Dodano testy jednostkowe i e2e dla poprawnego i błędnego loginu.

## Payload tokena

Access token zawiera minimalny payload:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "username": "username"
}
```

Nie wkładamy do tokena danych profilu ani uprawnień, których jeszcze nie mamy. Token ma być mały i czytelny.

## Dlaczego bez refresh tokena teraz?

Refresh token wymaga dodatkowych decyzji:

- gdzie przechowywać refresh token hash,
- czy tokeny rotować,
- jak obsłużyć wylogowanie,
- jak zabezpieczyć wiele sesji/urządzeń.

To jest osobny, wartościowy krok. Teraz potwierdzamy najpierw prosty login + access token.

## Co zweryfikowano

W `backend/` przechodzą:

```bash
npm run lint
npm run prisma:validate
npm run build
npm test
npm run test:e2e
```

Dodatkowo uruchomiono aplikację lokalnie na porcie `3001` i sprawdzono realnie:

- `POST /auth/register` tworzy użytkownika,
- `POST /auth/login` dla poprawnego hasła zwraca `accessToken`,
- `POST /auth/login` dla błędnego hasła zwraca HTTP `401`,
- testowy użytkownik smoke został usunięty z bazy.

## Następny krok

Dodać protected route i JWT guard:

1. `JwtStrategy` albo prosty guard,
2. `GET /auth/me`,
3. test e2e: request bez tokena → 401,
4. test e2e: request z tokenem → publiczny user.
