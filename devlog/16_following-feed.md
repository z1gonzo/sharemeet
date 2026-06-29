# 16: Feed obserwowanych — `GET /posts/following`

Data: 2026-06-29

## Kontekst

Po dodaniu relacji/follows ShareMeet ma już social graph, ale feed nadal był tylko globalny. Naturalny następny krok to feed postów od obserwowanych użytkowników.

Ten slice dodaje chroniony endpoint:

```http
GET /posts/following?limit=20&offset=0
```

## Co zrobiono

- Dodano `PostsService.findFollowingFeed`.
- Dodano chroniony endpoint `GET /posts/following`.
- Endpoint używa istniejącego `ListPostsQueryDto`, więc ma ten sam kontrakt `limit/offset` co globalny feed.
- Sortowanie pozostaje stabilne: `createdAt desc`, `id desc`.
- Endpoint zwraca publiczne dane postów i autorów bez pól auth.
- Dodano unit i e2e testy.

## Implementacja zapytania

Posty są filtrowane przez relację autora:

```ts
where: {
  author: {
    followers: {
      some: { followerId },
    },
  },
}
```

Czyli: zwróć posty tych autorów, dla których istnieje relacja `Follow` z `followerId = currentUserId`.

## API

### `GET /posts/following`

Wymaga JWT access tokena.

### Query params

| Param | Default | Walidacja | Znaczenie |
|---|---:|---|---|
| `limit` | `20` | integer `1..50` | Maksymalna liczba postów |
| `offset` | `0` | integer `>= 0` | Liczba najnowszych postów do pominięcia |

### Responses

| Status | Znaczenie |
|---|---|
| `200` | Zwrócono feed obserwowanych; może być pusty `[]` |
| `400` | Niepoprawne query params |
| `401` | Brak tokena albo token niepoprawny |

## Czego celowo nie dodano

- mieszania postów własnych użytkownika do feedu obserwowanych,
- rankingu feedu,
- cursor pagination,
- `totalCount`,
- prywatności `followers-only`,
- filtrowania po widoczności posta.

To zostaje na późniejsze etapy.

## Co zweryfikowano punktowo

```bash
npm test -- posts.service.spec.ts
npm run test:e2e -- posts.e2e-spec.ts
```

Wynik:

- `PostsService`: 9 testów przechodzi,
- `PostsController e2e`: 21 testów przechodzi.

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
- unit: 4 test suites, 29 testów,
- e2e: 4 test suites, 52 testy.

## Następny krok

Po tym slice ShareMeet ma już globalny feed i social feed. Sensowne następne kroki:

1. dodać `followersCount` / `followingCount` do publicznego profilu,
2. dodać komentarze,
3. doprecyzować widoczność/prywatność postów.

Rekomendacja: najpierw liczniki followers/following, bo są małe i przydadzą się frontendowi oraz profilom.
