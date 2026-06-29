# 13: Paginacja listy postów użytkownika — `GET /users/:username/posts`

Data: 2026-06-29

## Kontekst

Po dodaniu globalnego feedu `GET /posts?limit=20&offset=0` lista postów konkretnego użytkownika nadal zwracała całość. To tworzyło niespójny kontrakt API i potencjalny dług techniczny.

## Decyzja zakresu

Ujednolicamy list endpoints dla postów:

```http
GET /posts?limit=20&offset=0
GET /users/:username/posts?limit=20&offset=0
```

Oba endpointy korzystają z tego samego DTO query params: `ListPostsQueryDto`.

## Co zrobiono

- Rozszerzono `PostsService.findByAuthorId` o parametry:
  - `authorId`,
  - `limit`,
  - `offset`.
- `GET /users/:username/posts` przyjmuje `limit` i `offset` przez query params.
- Domyślne wartości:
  - `limit = 20`,
  - `offset = 0`.
- Walidacja jest taka sama jak w globalnym feedzie:
  - `limit`: integer `1..50`,
  - `offset`: integer `>= 0`.
- Sortowanie listy użytkownika zostało ujednolicone z globalnym feedem:
  - `createdAt desc`,
  - `id desc` jako stabilny tie-breaker.
- Dodano testy jednostkowe i e2e.

## Zakres API

### `GET /users/:username/posts`

Publiczny endpoint bez tokena.

Query params:

| Param | Default | Walidacja | Znaczenie |
|---|---:|---|---|
| `limit` | `20` | integer `1..50` | Maksymalna liczba postów użytkownika |
| `offset` | `0` | integer `>= 0` | Ile najnowszych postów użytkownika pominąć |

Responses:

| Status | Znaczenie |
|---|---|
| `200` | Lista postów użytkownika; może być pusta `[]` |
| `400` | Niepoprawne query params |
| `404` | Profil nie istnieje |

## Czego celowo nie dodano

- cursor-based pagination,
- total count,
- prywatności postów na profilu prywatnym,
- filtrowania widoczności,
- edycji/usuwania postów.

## Co zweryfikowano punktowo

```bash
npm test -- posts.service.spec.ts
npm run test:e2e -- users.e2e-spec.ts
```

Wynik:

- `PostsService`: 4 testy przechodzą,
- `UsersController e2e`: 10 testów przechodzi.

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
- e2e: 4 test suites, 28 testów.

## Następny krok

Najbardziej naturalny kolejny krok to edycja/usuwanie własnych postów:

```http
PATCH /posts/:id
DELETE /posts/:id
```

Zakres powinien pilnować własności posta: tylko autor może edytować/usunąć swój post.
