# 18: Widoczność postów — PUBLIC / FOLLOWERS / PRIVATE

Data: 2026-06-29

## Zmiana

Dodano `PostVisibility`:

```text
PUBLIC
FOLLOWERS
PRIVATE
```

Nowe pole `visibility` jest na modelu `Post` i domyślnie ma wartość `PUBLIC`.

## Zachowanie

- `POST /posts` przyjmuje opcjonalne `visibility`.
- `PATCH /posts/:id` pozwala autorowi zmienić `visibility`.
- Publiczny globalny feed `GET /posts` pokazuje tylko `PUBLIC`.
- Publiczna lista postów użytkownika `GET /users/:username/posts` pokazuje tylko `PUBLIC`.
- Publiczny `GET /posts/:id` zwraca tylko `PUBLIC`; dla `FOLLOWERS`/`PRIVATE` zachowuje się jak `404`.
- Following feed `GET /posts/following` pokazuje `PUBLIC` i `FOLLOWERS` od obserwowanych autorów.
- `PRIVATE` nie trafia do publicznych ani following feedów.

## Czego nie dodano

- osobnego endpointu podglądu własnych prywatnych postów,
- listy „moje posty”,
- cursor pagination,
- rozbudowanej polityki kont prywatnych.

## Testy punktowe

```bash
npm test -- posts.service.spec.ts
npm run test:e2e -- posts.e2e-spec.ts
npm run build
```

Wynik:

- `PostsService`: 11 testów,
- `PostsController e2e`: 22 testy,
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

- unit: 4 test suites, 32 testy,
- e2e: 4 test suites, 53 testy.

## Następny krok

Po widoczności postów sensowny następny większy slice to komentarze.
