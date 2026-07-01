# 33: Frontend owner edit/delete posts and comments

Data: 2026-07-01

## Zmiana

Dodano minimalne owner actions na froncie dla własnych postów i komentarzy.

Endpointy backendu były już gotowe:

```text
PATCH /posts/:id
DELETE /posts/:id
PATCH /comments/:id
DELETE /comments/:id
```

## Zakres

Dodano w `frontend/src/api.ts`:

- `updatePost(postId, payload, accessToken)`,
- `deletePost(postId, accessToken)`,
- `updateComment(commentId, payload, accessToken)`,
- `deleteComment(commentId, accessToken)`.

Dodano w `frontend/src/App.tsx`:

- owner-only `Edit` / `Delete` dla posta, gdy `currentUser.username === post.author.username`,
- inline edit posta z edycją `content` i `visibility`,
- delete posta z `window.confirm()` i refresh/usunięciem z feedu,
- owner-only `Edit` / `Delete` dla komentarza,
- inline edit komentarza,
- delete komentarza z lokalnym usunięciem z panelu,
- proste per-action loading/error state,
- auth guard dla akcji wymagających JWT.

## Rola coding workera

Zadanie zostało zlecone profilowi Hermes `coding` z modelem `moonshotai/kimi-k2.6` przez NVIDIA. Kimi dostał około 10 minut i przygotował działający pierwszy pass. Supervisor GPT-5.5 poprawił update lokalnych list po edycji posta, wykonał buildy, realny smoke test API/UI, dokumentację i commit.

## Smoke test

Zweryfikowano realnie:

1. PostgreSQL/Mongo z Docker Compose działały lokalnie.
2. Backend działał na `127.0.0.1:3000`.
3. Frontend działał na `127.0.0.1:5173`.
4. API smoke:
   - utworzono testowego użytkownika,
   - utworzono post i komentarz,
   - `PATCH /posts/:id` zmienił content i visibility,
   - `PATCH /comments/:id` zmienił content,
   - `DELETE /comments/:id` zwrócił `204`,
   - `DELETE /posts/:id` zwrócił `204`.
5. UI smoke:
   - zalogowano testowego właściciela,
   - UI pokazał `Edit`/`Delete` tylko dla własnego posta,
   - edycja posta z UI zaktualizowała backend i UI,
   - otwarcie komentarzy pokazało `Edit`/`Delete` dla własnego komentarza,
   - edycja komentarza z UI zaktualizowała backend i UI,
   - delete komentarza z UI usunął go z API,
   - delete posta z UI usunął go z API i z feedu,
   - konsola przeglądarki bez JS errors.

## Weryfikacja

```bash
cd frontend && npm run build
cd backend && npm run build
```

Oba buildy przeszły.

## Ryzyka / ograniczenia

- UI używa prostych inline controls i `window.confirm()` — polish UX świadomie odłożony.
- Przy usuwaniu komentarza karta lokalnie usuwa komentarz z panelu; licznik `commentsCount` jest odświeżany przez feed refresh / ponowne pobranie, jeśli potrzebne.
- Scope nie obejmuje pełnej strony profilu ani modalowego edytora.

## Następny krok

- Demo seed data / cleanup mockowych tekstów.
- Ewentualnie mały polish tylko dla owner action controls, jeśli stanie się to przeszkodą w demo.
