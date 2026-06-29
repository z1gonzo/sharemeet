# 19: Komentarze do publicznych postów

Data: 2026-06-29

## Zmiana

Dodano model `Comment` i endpointy komentarzy jako kolejny slice Core Social MVP.

## Endpointy

```http
POST /posts/:postId/comments
GET /posts/:postId/comments?limit=20&offset=0
PATCH /comments/:id
DELETE /comments/:id
```

## Zachowanie

- Komentarze są przypisane do `Post` i autora `User`.
- Tworzenie komentarza wymaga JWT.
- Lista komentarzy jest publiczna, ale tylko dla publicznych postów (`visibility = PUBLIC`).
- Komentarze są sortowane stabilnie: `createdAt asc, id asc`.
- `limit` ma zakres `1..50`, `offset` musi być `>= 0`.
- Tylko autor komentarza może go edytować albo usunąć.
- Brak publicznego posta przy tworzeniu/listowaniu komentarzy zwraca `404 Post not found`.
- Brak komentarza przy edycji/usuwaniu zwraca `404 Comment not found`.
- Próba modyfikacji cudzego komentarza zwraca `403 You can only modify your own comments`.

## Model

```prisma
model Comment {
  id        String   @id @default(uuid()) @db.Uuid
  postId    String   @map("post_id") @db.Uuid
  authorId  String   @map("author_id") @db.Uuid
  content   String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([authorId])
  @@map("comments")
}
```

## Czego nie dodano

- komentarzy do `FOLLOWERS`/`PRIVATE` postów,
- zagnieżdżonych odpowiedzi/threadów,
- soft delete,
- liczników komentarzy na postach,
- moderacji komentarzy.

## Testy punktowe

```bash
npm test -- comments.service.spec.ts
npm run test:e2e -- comments.e2e-spec.ts
npm run build
```

Wynik:

- `CommentsService`: 7 testów,
- `CommentsController e2e`: 16 testów,
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

Po komentarzach sensowny mały slice to `commentsCount` na postach albo endpoint „moje posty” dla prywatnych treści.
