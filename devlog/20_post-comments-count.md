# 20: `commentsCount` na postach

Data: 2026-06-29

## Zmiana

Publiczne odpowiedzi z postami zwracają teraz `commentsCount`.

Przykład:

```json
{
  "id": "uuid",
  "content": "Hello ShareMeet",
  "visibility": "PUBLIC",
  "commentsCount": 4
}
```

## Implementacja

Użyto Prisma `_count` na relacji `comments` w `postInclude`:

```ts
_count: {
  select: {
    comments: true,
  },
}
```

Nie dodano denormalizowanego pola w bazie i nie było potrzeby migracji.

## Dotknięte odpowiedzi

- `POST /posts`
- `GET /posts/:id`
- `GET /posts`
- `GET /posts/following`
- `PATCH /posts/:id`
- `GET /users/:username/posts`

## Testy punktowe

```bash
npm test -- posts.service.spec.ts
npm run test:e2e -- posts.e2e-spec.ts users.e2e-spec.ts
npm run build
```

Wynik:

- `PostsService`: 11 testów,
- `PostsController e2e` + `UsersController e2e`: 43 testy,
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

- unit: 5 test suites, 39 testów,
- e2e: 5 test suites, 69 testów.

## Następny krok

Po `commentsCount` sensowny następny slice to endpoint „moje posty” dla prywatnych/własnych treści albo przejście do podstawowego frontendu.
