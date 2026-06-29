# 12: Globalny feed postów — `GET /posts`

Data: 2026-06-29

## Kontekst

Po dodaniu postów tekstowych i listy postów konkretnego użytkownika brakowało minimalnego globalnego feedu. Dla MVP potrzebujemy prostego publicznego widoku najnowszych postów, zanim przejdziemy do relacji/follows i rankingu.

## Decyzja zakresu

Dodajemy mały, przewidywalny endpoint:

```http
GET /posts?limit=20&offset=0
```

Na tym etapie wybieramy paginację `limit/offset`, bo jest prostsza edukacyjnie i wystarcza do MVP. Cursor-based pagination zostaje na później, gdy feed będzie większy albo rankingowany.

## Co zrobiono

- Dodano `ListPostsQueryDto` dla query params `limit` i `offset`.
- Dodano walidację:
  - `limit`: liczba całkowita `1..50`, opcjonalnie,
  - `offset`: liczba całkowita `>= 0`, opcjonalnie.
- Dodano `PostsService.findFeed({ limit, offset })`.
- Dodano publiczne `GET /posts` w `PostsController`.
- Domyślne wartości:
  - `limit = 20`,
  - `offset = 0`.
- Feed sortuje posty od najnowszych:
  - `createdAt desc`,
  - `id desc` jako stabilny tie-breaker.
- Dodano testy jednostkowe i e2e.

## Zakres API

### `GET /posts`

Publiczny endpoint bez tokena.

Query params:

| Param | Default | Limit | Znaczenie |
|---|---:|---:|---|
| `limit` | `20` | `1..50` | Maksymalna liczba postów |
| `offset` | `0` | `>= 0` | Ile najnowszych postów pominąć |

Response `200`:

```json
[
  {
    "id": "uuid",
    "content": "Hello ShareMeet",
    "createdAt": "2026-06-29T00:00:00.000Z",
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "username": "z1gonzo",
      "displayName": "Łukasz",
      "avatarUrl": "https://example.com/avatar.png",
      "isPrivate": false
    }
  }
]
```

Author summary nie zawiera emaila ani pól auth.

## Czego celowo nie dodano

- cursor-based pagination,
- total count,
- filtrowania prywatności,
- feedu tylko dla znajomych/followed users,
- rankingu/rekomendacji,
- edycji/usuwania postów.

To są osobne kroki.

## Co zweryfikowano

W `backend/` przechodzą testy punktowe:

```bash
npm test -- posts.service.spec.ts
npm run test:e2e -- posts.e2e-spec.ts
```

Wynik:

- unit: `PostsService` — 4 testy,
- e2e: `PostsController` — 8 testów.

Pełna weryfikacja:

```bash
npm run lint
npm run prisma:validate
npm run build
npm test
npm run test:e2e
```

Wynik:

- lint: przechodzi,
- Prisma schema valid,
- build: przechodzi,
- unit: 4 test suites, 17 testów,
- e2e: 4 test suites, 26 testów.

Nie wykonano pełnego real smoke testu z zapisem do bazy, bo komenda zawierająca cleanup testowego użytkownika została zablokowana przez guard narzędzia. Serwer uruchomiony do smoke testu został zamknięty.

## Następny krok

Najbardziej naturalne kolejne opcje:

1. dodać paginację do `GET /users/:username/posts`, żeby oba list endpoints miały ten sam kontrakt,
2. albo dodać edycję/usuwanie własnych postów,
3. albo zacząć relacje/follows i później feed obserwowanych.

Rekomendacja: najpierw ujednolicić paginację list użytkownika, potem przejść do edycji/usuwania postów.
