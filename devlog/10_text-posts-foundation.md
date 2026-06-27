# 10: Text posts foundation — `POST /posts` i `GET /posts/:id`

Data: 2026-06-27

## Kontekst

Po domknięciu auth i podstaw profilu przechodzimy do pierwszej funkcji social MVP: postów tekstowych. Zakres jest celowo minimalny, bez feedu, komentarzy, lajków, edycji, usuwania i mediów.

## Co zrobiono

- Dodano model `Post` w Prisma.
- Dodano relację `User.posts` → `Post.author`.
- Dodano migrację `20260627160203_add_posts`.
- Dodano `PostsModule`, `PostsService`, `PostsController`.
- Dodano `CreatePostDto` z walidacją tekstu.
- Dodano chronione `POST /posts`.
- Dodano publiczne `GET /posts/:id`.
- Dodano testy jednostkowe i e2e.

## Zakres API

### `POST /posts`

- wymaga JWT access tokena,
- tworzy post dla aktualnego użytkownika,
- przyjmuje tylko `content`,
- `content` ma długość 1–1000 znaków.

### `GET /posts/:id`

- publiczny odczyt pojedynczego posta,
- zwraca autora jako publiczny author summary,
- nie zwraca emaila ani pól auth autora,
- brakujący post zwraca `404 Post not found`.

## Czego celowo nie dodano

- feedu,
- listy postów użytkownika,
- edycji/usuwania postów,
- komentarzy,
- lajków,
- mediów,
- visibility/privacy rules dla prywatnych profili.

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

- unit: 4 test suites, 15 tests,
- e2e: 4 test suites, 20 tests.

Dodatkowo uruchomiono aplikację lokalnie na porcie `3001` i sprawdzono realny flow:

- `POST /auth/register` → `201`,
- `POST /auth/login` → `201`,
- invalid `POST /posts` → `400`,
- `POST /posts` bez tokena → `401`,
- valid `POST /posts` → `201`,
- `GET /posts/:id` → `200`,
- `GET /posts/<missing>` → `404`.

Testowy użytkownik został usunięty z bazy, a dzięki `onDelete: Cascade` usunięty został też jego testowy post.

## Następny krok

Najmniejszy kolejny krok to lista postów użytkownika:

```http
GET /users/:username/posts
```

Alternatywnie można zacząć od globalnego prostego feedu:

```http
GET /posts
```
