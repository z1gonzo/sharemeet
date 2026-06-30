# 28: Frontend post composer API integration

Data: 2026-06-30

## Zmiana

Podłączono frontendowy composer do realnego backend endpointu:

```text
POST /posts
```

## Zakres

Dodano:

- `createPost()` w `frontend/src/api.ts`,
- typ payloadu `CreatePostPayload`,
- wysyłkę JWT access tokena przy tworzeniu posta,
- wymaganie zalogowania przed publikacją,
- loading state `Publishing…`,
- success/error feedback pod composerem,
- blokadę textarea/visibility/publish podczas publikowania,
- dodanie utworzonego posta do feed state na podstawie realnej odpowiedzi backendu,
- refresh global feed po publikacji publicznego posta.

## Decyzje

- `Publish` nie tworzy już lokalnego mocka.
- Brak tokena otwiera login panel i pokazuje komunikat.
- `PUBLIC` post po publikacji odświeża `GET /posts`.
- `FOLLOWERS`/`PRIVATE` post jest tworzony realnie, ale pełne wyświetlanie niepublicznych własnych postów wymaga kolejnego slice: `GET /posts/me`.

## Weryfikacja

Uruchomiono:

```bash
cd frontend
npm run build
```

Wynik: build przechodzi.

Uruchomiono:

```bash
cd backend
npm run build
```

Wynik: build przechodzi.

Realny smoke test przez UI:

1. PostgreSQL/MongoDB działały przez Docker Compose.
2. Uruchomiono backend na `http://127.0.0.1:3000`.
3. Uruchomiono frontend Vite na `http://127.0.0.1:5173`.
4. Utworzono testowego użytkownika i zapisano token w `localStorage`.
5. Frontend zhydratował sesję przez `GET /auth/me`.
6. Wpisano treść w composerze.
7. Kliknięto `Publish` w UI.
8. Backend utworzył post przez `POST /posts`.
9. `GET /posts` zwrócił utworzony post.
10. Frontend pokazał status `Post published and added to the live feed.` oraz kartę posta.
11. Sprawdzono DOM/API: post był widoczny w UI i backend feedzie.
12. Sprawdzono konsolę przeglądarki: brak błędów JS.

## Następny krok

Najbardziej naturalny kolejny slice:

```text
GET /posts/me dla zakładki My posts
```

Potem: following feed, profile/follow i comments list.
