# Architektura ShareMeet

## Cel architektury

Zbudować progresywnie rozwijaną social platform, zaczynając od prostego MVP auth/users, a dopiero później dodając media, realtime, kolejki i caching.

Projekt ma być edukacyjny: architektura powinna być jasna, opisana i rozwijana małymi krokami.

## Moduły

| Moduł | Odpowiedzialność | Status |
|---|---|---|
| `backend/` | API, auth, users, logika biznesowa | w trakcie, build obecnie nie przechodzi |
| `frontend/` | UI użytkownika | TODO |
| `db/` | Docker Compose dla PostgreSQL i MongoDB | częściowo gotowe |
| `docs/` | architektura i decyzje techniczne | gotowe jako szkielet |
| `devlog/` | dokumentacja nauki i uzasadnień | część głównego repo |

## Plan baz danych

W devlogu przyjęto architekturę hybrydową:

- PostgreSQL: users, friends, posts, comments
- MongoDB: media uploads, activity logs, notifications

Aktualny kod `users.schema.ts` używa jednak Mongoose/MongoDB dla users, więc wymaga decyzji i uporządkowania przed dalszym kodowaniem.

## Rekomendowany kierunek MVP

Na podstawie dotychczasowego planu najbardziej spójny kierunek to:

- users/auth w PostgreSQL przez Prisma albo TypeORM,
- MongoDB zostawić na późniejsze media/logi/notyfikacje,
- Google OAuth odłożyć do momentu, gdy prosty email/password + JWT działa stabilnie.

To nadal wymaga formalnego potwierdzenia w `docs/decisions.md` przed zmianami w kodzie.

## Priorytety architektoniczne

1. Najpierw działający monolit/modularny backend NestJS.
2. Jeden storage dla users/auth w MVP.
3. Potem frontend i podstawowy flow użytkownika.
4. Dopiero po MVP: Redis, GraphQL, WebSockets, queues.

## Ryzyka

- Za szybkie wejście w wiele technologii naraz.
- Mieszanie PostgreSQL/Prisma i Mongo/Mongoose w tym samym module.
- Brak testów auth przed rozbudową funkcji społecznościowych.
- Utrata procesu nauki, jeśli decyzje nie będą zapisywane w `devlog/` i `docs/decisions.md`.
