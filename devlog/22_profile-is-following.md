# 22: `isFollowing` na publicznym profilu

Data: 2026-06-29

## Zmiana

`GET /users/:username` zwraca teraz `isFollowing` dla opcjonalnie zalogowanego widza.

Przykład:

```json
{
  "username": "otheruser",
  "followersCount": 12,
  "followingCount": 8,
  "isFollowing": true
}
```

## Zachowanie

- Endpoint pozostaje publiczny.
- Bez tokena `isFollowing` zwraca `false`.
- Z poprawnym bearer tokenem backend sprawdza, czy aktualny użytkownik obserwuje profil.
- Niepoprawny token na tym publicznym endpointcie jest traktowany jak brak tokena, żeby publiczny odczyt profilu nie zmieniał się w endpoint chroniony.
- Self-follow zwraca `false`.

## Implementacja

- Dodano `UsersService.isFollowing(followerId, followingId)`.
- `UsersController.getPublicProfile()` opcjonalnie odczytuje JWT z headera `Authorization`.
- Nie dodano migracji — używany jest istniejący unikalny indeks `Follow(followerId, followingId)`.

## Testy punktowe

```bash
npm test -- users.service.spec.ts
npm run test:e2e -- users.e2e-spec.ts
npm run build
```

Wynik:

- `UsersService`: 17 testów,
- `UsersController e2e`: 23 testy,
- build: przechodzi.

## Pełna weryfikacja

```bash
npm run lint
npm run prisma:validate
npm run build
npm test
npm run test:e2e
```

Wynik:

- unit: 5 test suites, 42 testy,
- e2e: 5 test suites, 75 testów.

## Następny krok

Ten slice domyka bardzo praktyczne dane dla przycisku Follow/Unfollow. Następny logiczny krok to zacząć podstawowy frontend.
