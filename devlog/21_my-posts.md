# 21: Endpoint „moje posty” — `GET /posts/me`

Data: 2026-06-29

## Zmiana

Dodano chroniony endpoint:

```http
GET /posts/me?limit=20&offset=0
```

Endpoint zwraca posty aktualnie zalogowanego użytkownika niezależnie od widoczności:

```text
PUBLIC
FOLLOWERS
PRIVATE
```

## Dlaczego

Publiczne endpointy celowo filtrują prywatne treści:

- `GET /posts` pokazuje tylko `PUBLIC`,
- `GET /users/:username/posts` pokazuje tylko `PUBLIC`,
- `GET /posts/:id` ukrywa niepubliczne posty jako `404`.

Po dodaniu `PRIVATE` brakowało miejsca, w którym autor może zobaczyć własne prywatne/followers-only posty.

## Implementacja

- `PostsService.findOwnPosts({ authorId, limit, offset })`
- `PostsController.listMyPosts()`
- endpoint jest zarejestrowany przed `GET /posts/:id`, żeby `/posts/me` nie zostało potraktowane jako `id`
- używa istniejącego `ListPostsQueryDto`
- sortowanie: `createdAt desc`, `id desc`
- odpowiedź używa tego samego kształtu posta co pozostałe endpointy, w tym `visibility` i `commentsCount`

## Testy punktowe

```bash
npm test -- posts.service.spec.ts
npm run test:e2e -- posts.e2e-spec.ts
npm run build
```

Wynik:

- `PostsService`: 12 testów,
- `PostsController e2e`: 26 testów,
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

- unit: 5 test suites, 40 testów,
- e2e: 5 test suites, 73 testy.

## Następny krok

Po tym slicie backend ma już sensowny zestaw Core Social MVP. Następny logiczny wybór to rozpocząć podstawowy frontend albo dodać małe backendowe ulepszenia pod frontend, np. `isFollowing` na profilu publicznym.
