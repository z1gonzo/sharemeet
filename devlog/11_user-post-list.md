# 11: Lista postów użytkownika — `GET /users/:username/posts`

Data: 2026-06-27

## Kontekst

Po dodaniu pojedynczych postów tekstowych naturalnym następnym krokiem jest połączenie profilu z postami użytkownika. Nie robimy jeszcze globalnego feedu — najpierw zamykamy prosty flow:

```text
publiczny profil → posty tego użytkownika
```

## Co zrobiono

- Dodano `PostsService.findByAuthorId`.
- Wyeksportowano `PostsService` z `PostsModule`.
- Podłączono `PostsModule` do `UsersModule`.
- Dodano publiczne `GET /users/:username/posts`.
- Endpoint sprawdza, czy profil istnieje.
- Jeśli profil nie istnieje, zwraca `404 User profile not found`.
- Jeśli profil istnieje, ale nie ma postów, zwraca pustą listę `[]`.
- Lista jest sortowana od najnowszych postów: `createdAt desc`.
- Dodano testy jednostkowe i e2e.

## Zakres API

### `GET /users/:username/posts`

Publiczny endpoint bez tokena.

Zwraca listę postów publicznych użytkownika:

- `id`,
- `content`,
- `createdAt`,
- `updatedAt`,
- `author` summary.

Author summary nie zawiera emaila ani pól auth.

## Czego celowo nie dodano

- paginacji,
- limitów/offsetów,
- globalnego feedu,
- privacy rules dla prywatnych profili,
- filtrowania widoczności postów,
- edycji/usuwania postów.

To są kolejne małe kroki.

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

- unit: 4 test suites, 16 tests,
- e2e: 4 test suites, 23 tests.

Dodatkowo uruchomiono aplikację lokalnie na porcie `3001` i sprawdzono realny flow:

- `POST /auth/register` → `201`,
- `POST /auth/login` → `201`,
- dwa razy `POST /posts` → `201`,
- `GET /users/:username/posts` → `200`, lista 2 postów,
- kolejność listy: najnowszy post jako pierwszy,
- author summary bez emaila,
- `GET /users/no-such-user/posts` → `404`.

Testowy użytkownik został usunięty z bazy, a dzięki `onDelete: Cascade` usunięte zostały też jego testowe posty.

## Następny krok

Najmniejszy następny krok to jedna z dwóch opcji:

1. prosty globalny feed `GET /posts`,
2. paginacja dla `GET /users/:username/posts`.

Dla MVP bardziej praktyczny będzie teraz prosty globalny feed z limitem.
