# 09: Publiczny profil użytkownika — `GET /users/:username`

Data: 2026-06-27

## Kontekst

Po dodaniu chronionego `PATCH /users/me` potrzebny był pierwszy publiczny odczyt profilu. Ustaliliśmy, że:

- email nie jest publiczny,
- avatar może być publiczny,
- `avatarUrl` zostaje na razie zwykłym URL-em,
- obawy o brzydkie/nagie/przemocowe avatary zapisujemy jako ryzyko moderacyjne, ale nie blokujemy tym pierwszego endpointu profilu.

## Co zrobiono

- Dodano `UsersService.findByUsername`.
- Dodano publiczne `GET /users/:username`.
- Endpoint zwraca publiczny profil bez danych auth/prywatnych.
- Dodano `404 User profile not found` dla brakującego profilu.
- Dodano testy jednostkowe i e2e.
- Zaktualizowano dokumentację auth/profile API.

## Publiczny profil zwraca

- `id`,
- `username`,
- `displayName`,
- `bio`,
- `avatarUrl`,
- `isPrivate`,
- `createdAt`.

## Publiczny profil nie zwraca

- `email`,
- `passwordHash`,
- `isActive`,
- `updatedAt`.

## Moderacja avatarów

Na tym etapie `avatarUrl` jest publiczny, ale moderacja treści jest świadomie odłożona jako osobny temat. Ryzyko: użytkownik może wskazać URL do treści NSFW/przemocowej.

Rekomendowany późniejszy kierunek:

1. nie proxyować ani nie hostować cudzych obrazków bez zasad,
2. przy uploadzie pliku dodać moderację obrazu przed publikacją,
3. mieć `avatarModerationStatus`, np. `pending/approved/rejected`,
4. dla URL-i zewnętrznych rozważyć allowlistę domen albo pobranie obrazu do własnego storage po moderacji,
5. dodać placeholder avatara, gdy treść jest odrzucona.

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

- unit: 3 test suites, 13 tests,
- e2e: 3 test suites, 15 tests.

Dodatkowo uruchomiono aplikację lokalnie na porcie `3001` i sprawdzono realny flow:

- `POST /auth/register` → `201`,
- `POST /auth/login` → `201`,
- `PATCH /users/me` → `200`,
- `GET /users/:username` → `200`, publiczny profil bez email/passwordHash/isActive,
- `GET /users/no-such-user` → `404`.

Testowy użytkownik smoke został usunięty z bazy.

## Następny krok

Możemy teraz wybrać:

1. polish profilu: dokumentacja zasad public/private + przyszła moderacja avatara,
2. zacząć posty tekstowe,
3. dopiero później frontend.
