# 32: Frontend profile posts preview

Data: 2026-07-01

## Zmiana

Dodano mały preview najnowszych postów profilu w prawym panelu `Maria Kowalska`.

Endpoint:

```text
GET /users/:username/posts?limit=3&offset=0
```

## Zakres

Dodano:

- `getUserPosts(username)` w `frontend/src/api.ts`,
- stan `profilePosts`, `profilePostsStatus`, `profilePostsError` w `frontend/src/App.tsx`,
- równoległe pobieranie profilu i postów w `loadProfile()`,
- sekcję `RECENT POSTS` w prawym panelu,
- loading/error/empty state,
- skracanie długiej treści helperem `truncate()`.

## Rola coding workera

Zadanie zostało zlecone profilowi Hermes `coding` z modelem `moonshotai/kimi-k2.6` przez NVIDIA. Kimi dostał około 10 minut. Wprowadził działający kod i build przeszedł; supervisor GPT-5.5 zrobił smoke test, dokumentację i commit.

## Smoke test

Zweryfikowano realnie:

1. PostgreSQL/Mongo z Docker Compose działały lokalnie.
2. Backend działał na `127.0.0.1:3000`.
3. Frontend działał na `127.0.0.1:5173`.
4. Upewniono się, że użytkownik `maria` istnieje.
5. Utworzono publiczny post Marii przez `POST /posts`.
6. `GET /users/maria/posts?limit=3&offset=0` zwrócił post.
7. UI pokazał sekcję `RECENT POSTS`, treść posta, `PUBLIC` i `0 comments`.
8. Konsola przeglądarki bez JS errors.

## Weryfikacja

```bash
cd frontend && npm run build
cd backend && npm run build
```

Oba buildy przeszły.

## Następny krok

Małe kolejne kroki:

- polish UI sekcji profile posts,
- owner actions: edit/delete własnych postów lub komentarzy,
- demo seed data / cleanup mockowych tekstów.
