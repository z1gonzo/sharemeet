# Auth API

Stan na: 2026-06-29

Auth foundation jest obecnie celowo proste: email/password + JWT access token. Refresh token i Google OAuth są odłożone do backlogu, dopóki podstawowy backend i profil użytkownika nie są stabilne.

## `POST /auth/register`

Tworzy użytkownika i zwraca publiczne dane użytkownika bez `passwordHash`.

### Request

```json
{
  "email": "lukasz@example.com",
  "username": "z1gonzo",
  "password": "plain-password",
  "displayName": "Łukasz"
}
```

### Walidacja

- `email`: poprawny email,
- `username`: 3–30 znaków, litery/cyfry/underscore,
- `password`: 8–128 znaków,
- `displayName`: opcjonalnie 1–80 znaków.

### Responses

| Status | Znaczenie |
|---|---|
| `201` | Użytkownik utworzony |
| `400` | Niepoprawne dane wejściowe albo nieznane pole |
| `409` | Email lub username jest już zajęty |

## `POST /auth/login`

Weryfikuje email/password i zwraca JWT access token.

### Request

```json
{
  "email": "lukasz@example.com",
  "password": "plain-password"
}
```

### Response `201`

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "uuid",
    "email": "lukasz@example.com",
    "username": "z1gonzo",
    "displayName": "Łukasz"
  }
}
```

### Responses

| Status | Znaczenie |
|---|---|
| `201` | Login poprawny |
| `400` | Niepoprawne dane wejściowe |
| `401` | Błędny email albo hasło |

## `GET /auth/me`

Zwraca aktualnego użytkownika na podstawie JWT access tokena.

### Header

```http
Authorization: Bearer <accessToken>
```

### Responses

| Status | Znaczenie |
|---|---|
| `200` | Zwrócono publicznego użytkownika |
| `401` | Brak tokena albo token niepoprawny |

## `GET /users/:username`

Zwraca publiczny profil użytkownika. Endpoint nie wymaga tokena.

### Response `200`

```json
{
  "id": "uuid",
  "username": "z1gonzo",
  "displayName": "Łukasz G.",
  "bio": "Building ShareMeet",
  "avatarUrl": "https://example.com/avatar.png",
  "isPrivate": true,
  "createdAt": "2026-06-27T00:00:00.000Z"
}
```

Publiczny profil nie zwraca `email`, `passwordHash`, `isActive` ani `updatedAt`.

### Responses

| Status | Znaczenie |
|---|---|
| `200` | Zwrócono publiczny profil |
| `404` | Profil nie istnieje |

## `GET /users/:username/posts`

Zwraca publiczną listę postów konkretnego użytkownika. Endpoint nie wymaga tokena.

Posty są sortowane od najnowszych: `createdAt desc`, `id desc`.

### Query params

| Param | Default | Walidacja | Znaczenie |
|---|---:|---|---|
| `limit` | `20` | integer `1..50` | Maksymalna liczba postów użytkownika |
| `offset` | `0` | integer `>= 0` | Liczba najnowszych postów użytkownika do pominięcia |

### Responses

| Status | Znaczenie |
|---|---|
| `200` | Zwrócono listę postów; może być pusta `[]` |
| `400` | Niepoprawne query params |
| `404` | Profil nie istnieje |

## `POST /users/:username/follow`

Tworzy relację obserwowania aktualny użytkownik → użytkownik `:username`. Endpoint wymaga JWT access tokena.

### Header

```http
Authorization: Bearer ***
```

### Responses

| Status | Znaczenie |
|---|---|
| `201` | Follow utworzony; zwrócono publiczny profil obserwowanego użytkownika |
| `400` | Próba follow samego siebie |
| `401` | Brak tokena albo token niepoprawny |
| `404` | Profil nie istnieje |
| `409` | Relacja już istnieje |

## `DELETE /users/:username/follow`

Usuwa relację obserwowania aktualny użytkownik → użytkownik `:username`. Endpoint wymaga JWT access tokena.

Operacja jest idempotentna względem braku istniejącej relacji: jeśli użytkownik nie obserwował profilu, endpoint nadal zwraca `204`.

### Header

```http
Authorization: Bearer ***
```

### Responses

| Status | Znaczenie |
|---|---|
| `204` | Relacja usunięta albo już jej nie było; brak body |
| `400` | Próba unfollow samego siebie |
| `401` | Brak tokena albo token niepoprawny |
| `404` | Profil nie istnieje |

## `GET /users/:username/followers`

Zwraca publiczną listę profili obserwujących użytkownika. Endpoint nie wymaga tokena.

### Query params

| Param | Default | Walidacja | Znaczenie |
|---|---:|---|---|
| `limit` | `20` | integer `1..50` | Maksymalna liczba profili |
| `offset` | `0` | integer `>= 0` | Liczba najnowszych relacji do pominięcia |

### Responses

| Status | Znaczenie |
|---|---|
| `200` | Zwrócono listę profili; może być pusta `[]` |
| `400` | Niepoprawne query params |
| `404` | Profil nie istnieje |

## `GET /users/:username/following`

Zwraca publiczną listę profili obserwowanych przez użytkownika. Endpoint nie wymaga tokena.

Query params i responses są takie same jak dla `GET /users/:username/followers`.

## `PATCH /users/me`

Aktualizuje profil aktualnego użytkownika. Endpoint wymaga JWT access tokena.

### Header

```http
Authorization: Bearer <accessToken>
```

### Request

```json
{
  "displayName": "Łukasz G.",
  "bio": "Building ShareMeet",
  "avatarUrl": "https://example.com/avatar.png",
  "isPrivate": true
}
```

### Walidacja

- `displayName`: opcjonalnie 1–80 znaków,
- `bio`: opcjonalnie 0–280 znaków,
- `avatarUrl`: opcjonalnie poprawny URL z protokołem,
- `isPrivate`: opcjonalnie boolean.

### Responses

| Status | Znaczenie |
|---|---|
| `200` | Profil zaktualizowany |
| `400` | Niepoprawne dane wejściowe albo nieznane pole |
| `401` | Brak tokena albo token niepoprawny |

## `POST /posts`

Tworzy post tekstowy aktualnego użytkownika. Endpoint wymaga JWT access tokena.

### Header

```http
Authorization: Bearer <accessToken>
```

### Request

```json
{
  "content": "Hello ShareMeet"
}
```

### Walidacja

- `content`: tekst 1–1000 znaków,
- nieznane pola są odrzucane.

### Response `201`

```json
{
  "id": "uuid",
  "content": "Hello ShareMeet",
  "createdAt": "2026-06-27T00:00:00.000Z",
  "updatedAt": "2026-06-27T00:00:00.000Z",
  "author": {
    "id": "uuid",
    "username": "z1gonzo",
    "displayName": "Łukasz",
    "avatarUrl": "https://example.com/avatar.png",
    "isPrivate": false
  }
}
```

### Responses

| Status | Znaczenie |
|---|---|
| `201` | Post utworzony |
| `400` | Niepoprawne dane wejściowe albo nieznane pole |
| `401` | Brak tokena albo token niepoprawny |

## `PATCH /posts/:id`

Aktualizuje własny post tekstowy. Endpoint wymaga JWT access tokena.

### Header

```http
Authorization: Bearer ***
```

### Request

```json
{
  "content": "Edited ShareMeet post"
}
```

### Walidacja

- `content`: tekst 1–1000 znaków,
- nieznane pola są odrzucane.

### Responses

| Status | Znaczenie |
|---|---|
| `200` | Post zaktualizowany |
| `400` | Niepoprawne dane wejściowe albo nieznane pole |
| `401` | Brak tokena albo token niepoprawny |
| `403` | Próba edycji cudzego posta |
| `404` | Post nie istnieje |

## `DELETE /posts/:id`

Usuwa własny post tekstowy. Endpoint wymaga JWT access tokena.

### Header

```http
Authorization: Bearer ***
```

### Responses

| Status | Znaczenie |
|---|---|
| `204` | Post usunięty; brak body |
| `401` | Brak tokena albo token niepoprawny |
| `403` | Próba usunięcia cudzego posta |
| `404` | Post nie istnieje |

## `GET /posts/:id`

Zwraca publiczny post po id. Endpoint nie wymaga tokena.

### Responses

| Status | Znaczenie |
|---|---|
| `200` | Zwrócono publiczny post |
| `404` | Post nie istnieje |

## `GET /posts`

Zwraca publiczny globalny feed najnowszych postów. Endpoint nie wymaga tokena.

### Query params

| Param | Default | Walidacja | Znaczenie |
|---|---:|---|---|
| `limit` | `20` | integer `1..50` | Maksymalna liczba postów |
| `offset` | `0` | integer `>= 0` | Liczba najnowszych postów do pominięcia |

### Sortowanie

```text
createdAt desc, id desc
```

### Response `200`

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

### Responses

| Status | Znaczenie |
|---|---|
| `200` | Zwrócono listę postów; jeśli brak postów, `[]` |
| `400` | Niepoprawne query params |

## Decyzja: refresh token

Na tym etapie refresh token jest w backlogu. Powód: najpierw utrwalamy prosty, testowalny fundament `register → login → me`, potem przechodzimy do profilu użytkownika. Refresh token wróci, gdy pojawi się realna potrzeba sesji długotrwałych po stronie frontendu.
