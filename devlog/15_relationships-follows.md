# 15: Relacje/follows — fundament social feedu

Data: 2026-06-29

## Kontekst

Po domknięciu podstawowego CRUD dla postów tekstowych kolejnym sensownym krokiem jest model relacji użytkownik → użytkownik. Bez tego ShareMeet ma tylko globalny feed, a nie feed społecznościowy.

Ten slice dodaje minimalne `follow/unfollow` oraz publiczne listy followers/following. Nie buduje jeszcze feedu obserwowanych — to następny krok.

## Co zrobiono

- Dodano model Prisma `Follow` mapowany na tabelę `follows`.
- Dodano relacje `User.followers` i `User.following`.
- Dodano migrację `20260629123023_add_follows`.
- Dodano `ListUsersQueryDto` dla query params `limit` i `offset`.
- Dodano `UsersService.followUser`.
- Dodano `UsersService.unfollowUser`.
- Dodano `UsersService.listFollowers`.
- Dodano `UsersService.listFollowing`.
- Dodano endpointy:
  - `POST /users/:username/follow`,
  - `DELETE /users/:username/follow`,
  - `GET /users/:username/followers?limit=20&offset=0`,
  - `GET /users/:username/following?limit=20&offset=0`.
- Dodano unit i e2e testy.

## Model danych

```prisma
model Follow {
  id          String   @id @default(uuid()) @db.Uuid
  followerId  String   @map("follower_id") @db.Uuid
  followingId String   @map("following_id") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")

  follower  User @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}
```

## API

### `POST /users/:username/follow`

Wymaga JWT.

| Status | Znaczenie |
|---|---|
| `201` | Follow utworzony; zwraca publiczny profil obserwowanego użytkownika |
| `400` | Próba follow samego siebie |
| `401` | Brak tokena / zły token |
| `404` | Profil nie istnieje |
| `409` | Relacja już istnieje |

### `DELETE /users/:username/follow`

Wymaga JWT. Operacja jest idempotentna względem braku istniejącej relacji.

| Status | Znaczenie |
|---|---|
| `204` | Relacja usunięta albo już jej nie było |
| `400` | Próba unfollow samego siebie |
| `401` | Brak tokena / zły token |
| `404` | Profil nie istnieje |

### `GET /users/:username/followers`

Publiczne. Query params:

| Param | Default | Walidacja |
|---|---:|---|
| `limit` | `20` | integer `1..50` |
| `offset` | `0` | integer `>= 0` |

Zwraca publiczne profile obserwujących.

### `GET /users/:username/following`

Publiczne. Query params takie same jak `followers`. Zwraca publiczne profile obserwowanych użytkowników.

## Czego celowo nie dodano

- liczników `followersCount` / `followingCount`,
- feedu obserwowanych,
- statusu `isFollowing` na profilu,
- prywatnych zaproszeń follow dla kont `isPrivate`,
- blokowania użytkowników,
- powiadomień.

## Co zweryfikowano punktowo

```bash
npm test -- users.service.spec.ts
npm run test:e2e -- users.e2e-spec.ts
```

Wynik:

- `UsersService`: 14 testów przechodzi,
- `UsersController e2e`: 21 testów przechodzi.

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
- unit: 4 test suites, 28 testów,
- e2e: 4 test suites, 48 testów.

## Następny krok

Najbardziej naturalny następny slice to feed obserwowanych:

```http
GET /posts/following?limit=20&offset=0
```

Alternatywnie można dodać `followersCount`/`followingCount` do profilu publicznego albo zacząć comments.
