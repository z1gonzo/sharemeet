# 08: Pierwszy profil użytkownika — `PATCH /users/me`

Data: 2026-06-27

## Kontekst

Po zamknięciu podstawowego auth foundation zdecydowaliśmy na razie zostawić frontend i przejść do profilu użytkownika. Model `User` miał już pola profilowe: `displayName`, `bio`, `avatarUrl`, `isPrivate`, więc pierwszy krok nie wymaga migracji bazy.

## Co zrobiono

- Refresh token został przesunięty do backlogu.
- Dodano krótką dokumentację endpointów auth w `docs/auth-api.md`.
- Wydzielono konfigurację JWT do `JwtAccessModule`.
- Przeniesiono `JwtAuthGuard` do wspólnej ścieżki `common/guards`, żeby mógł chronić nie tylko endpointy auth.
- Dodano `UpdateProfileDto`.
- Dodano `UsersController`.
- Dodano chronione `PATCH /users/me`.
- Dodano `UsersService.updateProfile`.
- Endpoint zwraca publicznego użytkownika bez `passwordHash`.

## Zakres aktualizacji profilu

Na tym etapie użytkownik może zmieniać:

- `displayName`,
- `bio`,
- `avatarUrl`,
- `isPrivate`.

Nie zmieniamy jeszcze:

- emaila,
- username,
- hasła,
- avatara jako uploadu pliku.

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

- unit: 3 test suites, 12 tests,
- e2e: 3 test suites, 13 tests.

Dodatkowo uruchomiono aplikację lokalnie na porcie `3001` i sprawdzono realny flow:

- `POST /auth/register` → `201`,
- `POST /auth/login` → `201`,
- `PATCH /users/me` z tokenem → `200`, profil zaktualizowany,
- odpowiedź `PATCH /users/me` nie zawiera `passwordHash`,
- invalid `PATCH /users/me` → `400`,
- `PATCH /users/me` bez tokena → `401`,
- `GET /auth/me` po patchu zwraca zaktualizowany profil.

Testowy użytkownik smoke został usunięty z bazy.

## Następny krok

Dodać czytelny profil publiczny, np. `GET /users/:username`, albo rozbudować model profilu o pola produktowe po krótkiej decyzji: które informacje w profilu są publiczne, a które prywatne.
