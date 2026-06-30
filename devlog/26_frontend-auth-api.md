# 26: Frontend auth API integration

Data: 2026-06-30

## Zmiana

Podłączono frontendowe ekrany Login/Register do realnego backend API.

## Zakres

Dodano:

- klienta API w `frontend/src/api.ts`,
- `POST /auth/register` z formularza Register,
- automatyczny login po udanej rejestracji,
- `POST /auth/login` z formularza Login,
- zapis JWT access token w `localStorage` pod kluczem `sharemeet.accessToken`,
- hydratację sesji przez `GET /auth/me`,
- sidebar pokazujący zalogowanego użytkownika,
- logout usuwający token z `localStorage`,
- lokalny CORS w backendzie dla Vite dev servera.

## Decyzje

- Token jest na razie przechowywany w `localStorage`, bo to prosty portfolio/MVP slice.
- Refresh token i cookie/session hardening zostają w backlogu.
- Register po sukcesie robi login, ponieważ backendowy `POST /auth/register` zwraca public usera bez tokena.
- Feed, profile, follow i comments pozostają jeszcze mockowane po stronie frontendu.

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
npm run prisma:validate
npx prisma migrate status
```

Wynik: build backendu przechodzi, schema Prisma jest poprawna, migracje są aktualne.

Realny smoke test przez UI:

1. uruchomiono backend na `http://127.0.0.1:3000`,
2. uruchomiono frontend Vite na `http://127.0.0.1:5173`,
3. podniesiono PostgreSQL/MongoDB przez Docker Compose,
4. utworzono nowego użytkownika przez formularz Register,
5. frontend zapisał JWT access token w `localStorage`,
6. `GET /auth/me` z tym tokenem zwrócił `200`,
7. sidebar pokazał zalogowanego użytkownika,
8. logout usunął token z `localStorage`,
9. login istniejącym użytkownikiem zadziałał w UI.

## Ryzyka / backlog

- Brak refresh tokena.
- Brak produkcyjnej strategii token storage.
- Brak globalnego auth context/routera; obecny slice jest prosty i lokalny w `App.tsx`.
- Feed nadal jest mockowany — następny logiczny krok to `GET /posts`.
