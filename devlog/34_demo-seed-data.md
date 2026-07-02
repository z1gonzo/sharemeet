# 34: Deterministic demo seed data

Data: 2026-07-02

## Zmiana

Dodano idempotentny seed demo dla backendu, żeby nie tworzyć losowych smoke-test userów i postów przy każdej sesji.

Nowa komenda:

```bash
cd backend
npm run seed:demo
```

## Dane demo

Stałe konta demo:

| Username | Email | Password |
|---|---|---|
| `z1gonzo` | `z1gonzo@sharemeet.local` | `DemoPass123!` |
| `maria` | `maria@sharemeet.local` | `DemoPass123!` |
| `adam` | `adam@sharemeet.local` | `DemoPass123!` |
| `kasia` | `kasia@sharemeet.local` | `DemoPass123!` |

Seed tworzy / aktualizuje:

- 4 stałych użytkowników,
- 8 postów demo (`PUBLIC`, `FOLLOWERS`, `PRIVATE`),
- 4 relacje follow,
- 4 komentarze.

## Idempotencja

Skrypt używa stabilnych identyfikatorów dla demo postów/komentarzy i realnych użytkowników rozwiązanych po `username`. Można odpalać go wielokrotnie bez duplikowania demo records.

Nie robi destrukcyjnego resetu całej bazy — dotyka tylko stałych demo records.

## Rola coding workera

Zadanie zostało zlecone profilowi Hermes `coding` z modelem `moonshotai/kimi-k2.6` przez NVIDIA. Kimi przygotował pierwszy pass: skrypt `backend/scripts/seed-demo.ts` i npm script `seed:demo`, ale zakończył przez rate limit `HTTP 429`. Supervisor GPT-5.5 zrobił review, poprawił rozwiązywanie realnych `user.id` z DB, uruchomił seed wielokrotnie, zweryfikował idempotencję i zaktualizował docs.

## Weryfikacja

Uruchomiono:

```bash
cd backend
npm run build
npm run seed:demo
npm run seed:demo
```

Weryfikacja DB po drugim uruchomieniu:

- demo users: 4,
- demo posts: 8,
- demo follows: 4,
- demo comments: 4,
- hasło `DemoPass123!` działa dla `z1gonzo`.

## Ryzyka / ograniczenia

- Demo password jest celowo publiczne i tylko lokalne/developmentowe.
- Seed aktualizuje stałe demo konta po `username` / `email`, więc nie należy używać tych kont jako prywatnych danych produkcyjnych.
- Seed nie czyści losowych smoke-test records utworzonych wcześniej; można to zrobić osobnym, ostrożnym cleanup taskiem.

## Następny krok

- Podpiąć workflow README: `docker compose up -d`, `npm run seed:demo`, start backend/frontend.
- Opcjonalnie dodać osobny cleanup skrypt dla starych `uiowner*`, `owneractions*`, `comments*` smoke records, ale tylko jeśli będzie potrzebny.
