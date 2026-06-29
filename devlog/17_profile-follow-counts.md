# 17: Liczniki followers/following na publicznym profilu

Data: 2026-06-29

## Zmiana

`GET /users/:username` zwraca teraz:

```json
{
  "followersCount": 12,
  "followingCount": 8
}
```

## Implementacja

- Dodano `UsersService.findPublicProfileByUsername`.
- Zapytanie używa Prisma `_count` dla relacji `followers` i `following`.
- Publiczny profil nadal nie zwraca `email`, `passwordHash`, `isActive`, `updatedAt`.
- Listy followers/following i follow/unfollow bez zmian.

## Testy punktowe

```bash
npm test -- users.service.spec.ts
npm run test:e2e -- users.e2e-spec.ts
```

Wynik:

- `UsersService`: 15 testów,
- `UsersController e2e`: 21 testów.

## Pełna weryfikacja

```bash
npm run lint
npm run prisma:validate
npm run build
npm test
npm run test:e2e
```

Wynik:

- unit: 4 test suites, 30 testów,
- e2e: 4 test suites, 52 testy.

## Następny krok

Po licznikach sensowny kolejny slice to komentarze albo widoczność/prywatność postów.
