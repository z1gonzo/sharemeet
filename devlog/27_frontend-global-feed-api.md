# 27: Frontend global feed API integration

Data: 2026-06-30

## Zmiana

Podłączono frontendowy global feed do realnego backend endpointu:

```text
GET /posts?limit=20&offset=0
```

## Zakres

Dodano:

- typy `ApiPost` i `ApiPostAuthor` w `frontend/src/api.ts`,
- funkcję `getGlobalPosts()`,
- pobieranie globalnego feedu po starcie aplikacji,
- status synchronizacji feedu: loading/ready/error,
- przycisk `Refresh`,
- mapowanie odpowiedzi backendu na istniejący `PostCard`,
- empty/error state dla feedu,
- formatowanie czasu względnego dla `createdAt`.

## Decyzje

- `Global` jest teraz realnie zasilany z backendu.
- `Following`, `My posts`, composer, profile, follow i comments pozostają kolejnymi slice’ami integracji.
- Komentarze na kartach posta pokazują realny `commentsCount`, ale lista komentarzy nie jest jeszcze pobierana.
- Jeśli backend/DB nie działa, UI pokazuje błąd feedu i nie ukrywa problemu.

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

Realny smoke test:

1. PostgreSQL/MongoDB działały przez Docker Compose.
2. Uruchomiono backend na `http://127.0.0.1:3000`.
3. Uruchomiono frontend Vite na `http://127.0.0.1:5173`.
4. Utworzono testowego użytkownika przez backend API.
5. Zalogowano go i utworzono publiczny post przez `POST /posts`.
6. `GET /posts?limit=20&offset=0` zwrócił utworzony post.
7. Frontend pokazał status `Live from API` i kartę realnego posta.
8. Sprawdzono DOM: treść realnego posta była widoczna.
9. Sprawdzono konsolę przeglądarki: brak błędów JS.

## Następny krok

Najbardziej naturalny kolejny slice:

```text
POST /posts z composera frontendu
```
