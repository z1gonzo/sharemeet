# 35: Safe cleanup for old smoke-test data

Data: 2026-07-02

## Zmiana

Dodano bezpieczny backendowy skrypt do wykrywania i opcjonalnego usuwania starych losowych smoke-test records z lokalnej bazy.

Nowe komendy:

```bash
cd backend
npm run cleanup:smoke
npm run cleanup:smoke:apply
```

## Bezpieczeństwo

`npm run cleanup:smoke` jest domyślnym trybem **DRY RUN** i nie usuwa danych.

Realne usuwanie wymaga jawnego:

```bash
npm run cleanup:smoke:apply
```

albo:

```bash
ts-node scripts/cleanup-smoke-data.ts --apply
```

Skrypt nigdy nie dotyka kont demo:

- `z1gonzo`,
- `maria`,
- `adam`,
- `kasia`.

Nie robi globalnego resetu bazy.

## Kandydaci

Skrypt wykrywa kandydatów tylko po znanych wzorcach starych smoke testów:

- znane prefixy username/email, np. `uiowner`, `owneractions`, `comments`, `profilefollower`, `following`, `followed`, `feed`,
- znany kształt browser smoke `ui<digits>`,
- lokalny smoke domain `example.com`.

Jeśli pattern nie jest pewny, powinien zostać pominięty albo obsłużony osobnym review.

## Dry-run wykonany lokalnie

Uruchomiono:

```bash
cd backend
npm run cleanup:smoke
```

Wynik dry-run:

- kandydaci users: 12,
- zależne posts: 6,
- zależne comments: 2,
- zależne follows: 2,
- brak zmian w DB.

## Weryfikacja

Uruchomiono:

```bash
cd backend
npm run prisma:validate
npm run build
npm run cleanup:smoke
```

## Rola coding workera

Zadanie dostał Hermes profile `coding` z Kimi K2.6 przez NVIDIA. Kimi stworzył pierwszy pass `backend/scripts/cleanup-smoke-data.ts`. Końcowy output Kimi był zaśmiecony, więc supervisor GPT-5.5 zrobił niezależny review, poprawił zbyt szeroki pattern `ui*`, dodał npm scripts, dry-run, docs i finalną weryfikację.

## Ryzyka / ograniczenia

- `cleanup:smoke:apply` jest destrukcyjne dla kandydatów, więc powinno być uruchamiane świadomie.
- Skrypt opiera się na lokalnych konwencjach smoke-test usernames/emails, nie jest produkcyjnym narzędziem migracyjnym.
- Realnego `--apply` nie uruchamiano w tej sesji — tylko dry-run.

## Następny krok

- Jeśli dry-run wygląda dobrze, można świadomie odpalić `npm run cleanup:smoke:apply`.
- Po cleanupie można ponownie uruchomić `npm run seed:demo`, żeby demo stan był czysty i powtarzalny.
