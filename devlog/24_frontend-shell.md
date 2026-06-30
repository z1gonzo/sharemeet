# 24: Pierwszy produkcyjny frontend slice

Data: 2026-06-30

## Zmiana

Dodano pierwszy produkcyjny frontend w katalogu:

```text
frontend/
```

Stack:

```text
Vite + React + TypeScript
```

## Zakres

To jest jeszcze mockowany UI slice — bez integracji z backend API.

Dodano:

- Focus Dark social-tech app shell,
- lewy sidebar z nawigacją,
- główny feed,
- composer posta,
- visibility pills: `PUBLIC`, `FOLLOWERS`, `PRIVATE`,
- post cards z `visibility` i `commentsCount`,
- comments preview,
- prawy panel profilu z `followersCount`, `followingCount`, `isFollowing`,
- backend contract card pokazujący portfolio features,
- responsive single-column fallback.

## Dlaczego tak

Celem tego kroku było przejście z wyrzucalnego mockupu HTML do realnego frontendu, ale bez ryzyka mieszania layoutu z integracją API.

Najpierw stabilizujemy:

1. layout,
2. kierunek wizualny,
3. komponenty feed/profil/post,
4. podstawowe interakcje lokalne.

Dopiero później podłączymy API.

## Weryfikacja

```bash
cd frontend
npm install
npm run build
```

Wynik:

- TypeScript build przechodzi,
- Vite production build przechodzi,
- aplikacja renderuje się lokalnie przez `npm run dev -- --port 5173`,
- sprawdzono wizualnie w przeglądarce.

## Następny krok

Rekomendowany kolejny mały slice:

```text
frontend auth screens: login/register mock UI w stylu Focus Dark
```

albo jeśli chcemy szybciej pokazać działanie backendu:

```text
podłączyć global feed GET /posts do mockowanego feedu
```

Moja rekomendacja: jeszcze jeden UI slice dla login/register, potem API.
