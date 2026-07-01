# 30: Frontend comments API integration

Data: 2026-07-01

## Zmiana

Podłączono frontendowy panel komentarzy do backendowych endpointów:

```text
GET /posts/:postId/comments?limit=20&offset=0
POST /posts/:postId/comments
```

## Zakres

Dodano:

- typ `ApiComment` w `frontend/src/api.ts`,
- `getPostComments(postId)`,
- `createComment(postId, payload, accessToken)`,
- mapowanie `ApiComment -> CommentItem`,
- pobieranie komentarzy po otwarciu panelu komentarzy posta,
- prosty formularz dodawania komentarza,
- loading/error/posting state dla panelu komentarzy,
- auth guard: brak JWT pokazuje login i komunikat `Sign in to comment.`.

## Smoke test

Zweryfikowano realnie:

1. PostgreSQL/Mongo z Docker Compose działały lokalnie.
2. Backend działał na `127.0.0.1:3000`.
3. Frontend działał na `127.0.0.1:5173`.
4. Utworzono testowego użytkownika przez `POST /auth/register`.
5. Zalogowano go przez `POST /auth/login`.
6. Utworzono publiczny post przez `POST /posts`.
7. Utworzono komentarz przez `POST /posts/:postId/comments`.
8. `GET /posts/:postId/comments` zwrócił komentarz.
9. UI po otwarciu panelu komentarzy pokazało komentarz z API.
10. UI formularz komentarza utworzył drugi komentarz.
11. API potwierdziło, że drugi komentarz istnieje.
12. Konsola przeglądarki bez JS errors.

## Weryfikacja

```bash
cd frontend && npm run build
cd backend && npm run build
```

Oba buildy przeszły.

## Uwagi

Pierwsza część kodu została wykonana przez osobny profil Hermes `coding` z modelem `moonshotai/kimi-k2.6` przez NVIDIA. Kimi przygotował typy i helpery API, ale nie domknął integracji UI; supervisor GPT-5.5 dokończył logikę `PostCard`, smoke test i dokumentację.

## Następny krok

Podłączyć publiczny profil i follow/unfollow na froncie:

```text
GET /users/:username
POST /users/:username/follow
DELETE /users/:username/follow
```
