# 25: Frontend auth screens

Data: 2026-06-30

## Zmiana

Dodano mockowane ekrany auth w istniejącym froncie:

```text
frontend/src/App.tsx
frontend/src/styles.css
```

## Zakres

Dodano:

- przełączniki `Login` / `Register` w sidebarze i hero,
- panel auth w stylu Focus Dark,
- formularz `Login` z polami email/password,
- formularz `Register` z polami username/email/password,
- przełącznik trybu Login/Register w panelu,
- preview backend contract:
  - `POST /auth/register`,
  - `POST /auth/login`,
  - `GET /auth/me`,
- mockowany submit status pokazujący, który endpoint będzie podłączony.

## Dlaczego bez API

To nadal jest kontrolowany UI slice. Celem było domknięcie portfolio flow wizualnie przed integracją API.

Backend auth już istnieje, ale API podłączymy osobnym krokiem, żeby nie mieszać:

1. layoutu,
2. local state,
3. fetch/error handling,
4. token storage,
5. autoryzowanych requestów.

## Weryfikacja

```bash
cd frontend
npm run build
```

Wynik:

- TypeScript build przechodzi,
- Vite production build przechodzi,
- lokalny Vite renderuje panel login/register,
- sprawdzono wizualnie w przeglądarce,
- submit mock status działa przez formularz.

## Następny krok

Rekomendowany następny mały slice:

```text
podłączyć POST /auth/login i POST /auth/register do backendu + zapisać access token
```

Dopiero potem:

```text
GET /auth/me i autoryzowany composer/feed
```
