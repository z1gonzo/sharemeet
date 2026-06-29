# Architektura ShareMeet

## Cel architektury

Zbudować progresywnie rozwijaną social platform, zaczynając od prostego MVP auth/users, a dopiero później dodając media, realtime, kolejki i caching.

Projekt ma być edukacyjny: architektura powinna być jasna, opisana i rozwijana małymi krokami.

## Moduły

| Moduł | Odpowiedzialność | Status |
|---|---|---|
| `backend/` | API, auth, users, posts, follows, comments, logika biznesowa | NestJS + Prisma 6 + auth + profile + text posts CRUD + visibility + global/following feeds + follow relationships + comments |
| `frontend/` | UI użytkownika | TODO |
| `db/` | Docker Compose dla PostgreSQL i MongoDB | PostgreSQL działa lokalnie na porcie hosta `5433`; MongoDB na później |
| `docs/` | architektura, decyzje techniczne i krótkie referencje API | auth API i lekka polityka profilu opisane w `docs/` |
| `devlog/` | dokumentacja nauki i uzasadnień | część głównego repo |

## Plan baz danych

W devlogu przyjęto architekturę hybrydową:

- PostgreSQL: users, friends, posts, comments
- MongoDB: media uploads, activity logs, notifications

Kod auth/users oparty o Mongoose został usunięty 2026-06-27 jako eksperyment niespójny z planem. Fundament PostgreSQL + Prisma został rozpoczęty: `backend/prisma/schema.prisma`, migracja `init_user`, globalny `PrismaModule`, `PrismaService`, minimalny `UsersService`, `POST /auth/register`, `POST /auth/login` z JWT access token, chronione `GET /auth/me`, DTO validation, przyjazne konflikty `409`, protected `PATCH /users/me`, publiczne `GET /users/:username`, pierwsze posty tekstowe przez `POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id`, `GET /posts/:id`, `PostVisibility` (`PUBLIC`, `FOLLOWERS`, `PRIVATE`), globalny feed `GET /posts?limit=20&offset=0`, chroniony feed obserwowanych `GET /posts/following?limit=20&offset=0`, paginowana lista postów użytkownika `GET /users/:username/posts?limit=20&offset=0`, follow relationships przez `POST/DELETE /users/:username/follow` i listy followers/following oraz komentarze przez `POST/GET /posts/:postId/comments`, `PATCH/DELETE /comments/:id`.

## Rekomendowany kierunek MVP

Na podstawie dotychczasowego planu najbardziej spójny kierunek to:

- users/auth w PostgreSQL przez Prisma albo TypeORM,
- MongoDB zostawić na późniejsze media/logi/notyfikacje,
- Google OAuth odłożyć do momentu, gdy prosty email/password + JWT działa stabilnie.

To zostało formalnie potwierdzone decyzją z 2026-06-27 w `docs/decisions.md`.

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
