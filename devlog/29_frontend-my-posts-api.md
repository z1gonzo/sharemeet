# 29: Frontend My posts API integration

Data: 2026-06-30

## Zmiana

Podłączono zakładkę `My posts` do chronionego backend endpointu:

```text
GET /posts/me?limit=20&offset=0
```

## Zakres

Dodano:

- `getMyPosts(accessToken)` w `frontend/src/api.ts`,
- osobny stan listy `myPosts`,
- osobne loading/error/ready state dla zakładki `My posts`,
- refresh zależny od aktywnej zakładki,
- auth guard dla `My posts`: brak tokena pokazuje komunikat zamiast mockowanych danych,
- automatyczne pobieranie własnych postów po wejściu w zakładkę `My posts`,
- czyszczenie `myPosts` przy logout,
- dodawanie utworzonego posta także do `myPosts` state,
- widoczny status `My posts from API`.

## Decyzje

- `Global` nadal pobiera `GET /posts`.
- `My posts` pobiera teraz `GET /posts/me` i pokazuje także `FOLLOWERS` oraz `PRIVATE` posty właściciela.
- `Following`, profile, follow i listy komentarzy zostają kolejnymi slice’ami.

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
4. Utworzono testowego użytkownika i zapisano JWT token w `localStorage`.
5. Frontend zhydratował sesję przez `GET /auth/me`.
6. W composerze wybrano `PRIVATE`.
7. Kliknięto `Publish` w UI.
8. Backend utworzył prywatny post przez `POST /posts`.
9. Zakładka `My posts` pokazała status `My posts from API` i wyrenderowała prywatny post.
10. `GET /posts/me` zwrócił ten prywatny post.
11. `GET /posts` nie zwrócił prywatnego posta, zgodnie z visibility rules.
12. Sprawdzono konsolę przeglądarki: brak błędów JS.

## Następny krok

Najbardziej naturalny kolejny slice:

```text
GET /posts/following dla zakładki Following
```

Potem: public profile/follow state i comments list.
