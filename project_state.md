# Stan projektu ShareMeet

> Single source of truth. Hermes/Cline/Codex nie zakładają stanu z pamięci rozmowy — najpierw czytają ten plik, `plan.md`, `AGENTS.md` i `README.md`.

## Status

- Etap: Faza 2 — Core Social MVP / Post visibility
- Ostatnia sesja: 2026-06-29
- Repo: lokalny git zainicjalizowany w głównym projekcie `sharemeet/`, remote ustawiony na `git@github.com:z1gonzo/sharemeet.git`
- Główne ryzyko: komentarze nie istnieją
- Następny krok: zacząć comments

## Organizacja projektu

- Główny projekt to `sharemeet/`.
- Proces nauki i uzasadnienia decyzji zostają w repo w katalogu `devlog/`.
- Osobny pusty projekt `sharemeet-devlog` został usunięty z aktywnego workspace przez archiwizację: `<local-archive>/sharemeet-devlog_20260622_232457`.
- Jeśli devlog kiedyś ma stać się publicznym blogiem/kursem, można go wydzielić później świadomie.

## Co działa

- Istnieje struktura projektu `backend/`, `db/`, `devlog/`, `docs/`.
- `db/docker-compose.yml` definiuje PostgreSQL 16 i MongoDB 7.
- Backend jest czystym szkieletem NestJS po resecie auth/users.
- Prisma 6 jest skonfigurowana jako warstwa dostępu do PostgreSQL.
- Istnieje pierwszy model `User` i model `Post` w `backend/prisma/schema.prisma`.
- Istnieją i zostały zastosowane migracje `init_user` oraz `add_posts`.
- `PrismaModule` i `PrismaService` są dodane do backendu.
- Minimalny `UsersModule` i `UsersService` obsługują tworzenie użytkownika oraz wyszukiwanie po email/id.
- `AuthModule` obsługuje `POST /auth/register`, hashuje hasło i nie zwraca `passwordHash` w odpowiedzi.
- `AuthModule` obsługuje `POST /auth/login`, porównuje hasło i zwraca JWT access token.
- `AuthModule` obsługuje chronione `GET /auth/me` przez `JwtAuthGuard`.
- Register/login mają walidację DTO przez globalny `ValidationPipe`.
- Konflikty unikalności email/username są mapowane na czytelne `409 Conflict`.
- Refresh token i Google OAuth są odłożone do backlogu.
- Istnieje dokumentacja auth API: `docs/auth-api.md`.
- `UsersModule` obsługuje chronione `PATCH /users/me` dla aktualizacji profilu.
- `UsersModule` obsługuje publiczne `GET /users/:username` bez ujawniania email/passwordHash/isActive.
- Avatar URL jest publiczny na razie; automatyczna moderacja jest odłożona, a przyszłe reportowanie profilu/avatarów opisuje `docs/profile-content-policy.md`.
- `PostsModule` obsługuje chronione `POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id`, `PostVisibility` (`PUBLIC`, `FOLLOWERS`, `PRIVATE`), chroniony feed obserwowanych `GET /posts/following?limit=20&offset=0`, publiczne `GET /posts/:id`, publiczny globalny feed `GET /posts?limit=20&offset=0` i paginowaną listę postów użytkownika `GET /users/:username/posts?limit=20&offset=0` przez `UsersModule`.
- `UsersModule` obsługuje relacje: `POST /users/:username/follow`, `DELETE /users/:username/follow`, `GET /users/:username/followers?limit=20&offset=0`, `GET /users/:username/following?limit=20&offset=0`.
- Publiczne profile `GET /users/:username` zwracają `followersCount` i `followingCount`.
- PostgreSQL z Docker Compose działa lokalnie na porcie hosta `5433`.
- `npm run build` w `backend/` przechodzi.
- `npm test` i `npm run test:e2e` w `backend/` przechodzą: 8 test suites, 85 testów łącznie.
- Istnieje devlog opisujący plan PostgreSQL + MongoDB: `devlog/01_db-choice.md`.
- Repo ma standardowe pliki workflow dla pracy Hermes ↔ VSCode/Cline/Codex.

## Co nie działa / wymaga naprawy

Zweryfikowane przez `npm run lint && npm run prisma:validate && npm run build && npm test && npm run test:e2e` w `backend/` na 2026-06-29:

- Brakuje komentarzy.
- Reportowanie profilu/avatarów jest świadomie w backlogu, nie w bieżącym zakresie.

## Ostatnio wykonane

Data: 2026-06-29 — Post visibility

- Dodano Prisma enum `PostVisibility`: `PUBLIC`, `FOLLOWERS`, `PRIVATE`.
- Dodano migrację `20260629160111_add_post_visibility`.
- `POST /posts` i `PATCH /posts/:id` obsługują opcjonalne `visibility`.
- Publiczne feedy/listy zwracają tylko `PUBLIC`; following feed zwraca `PUBLIC` i `FOLLOWERS` od obserwowanych autorów.
- Publiczne `GET /posts/:id` zwraca tylko `PUBLIC`; pozostałe widoczności są ukryte jako `404`.
- Dodano devlog `devlog/18_post-visibility.md`.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-29 — Profile follow counts

- Dodano `UsersService.findPublicProfileByUsername` z Prisma `_count` dla relacji `followers` i `following`.
- `GET /users/:username` zwraca `followersCount` i `followingCount`.
- Dodano devlog `devlog/17_profile-follow-counts.md`.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-29 — Following feed

- Dodano `PostsService.findFollowingFeed`.
- Dodano chronione `GET /posts/following?limit=20&offset=0`.
- Endpoint filtruje posty po relacji `Follow`: autor posta musi być obserwowany przez aktualnego użytkownika.
- Endpoint używa istniejącego `ListPostsQueryDto` i sortowania `createdAt desc`, `id desc`.
- Dodano devlog `devlog/16_following-feed.md`.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-29 — Relationships/follows

- Dodano model Prisma `Follow` i migrację `20260629123023_add_follows`.
- Dodano `ListUsersQueryDto` dla paginacji list użytkowników.
- Dodano `POST /users/:username/follow` i `DELETE /users/:username/follow`.
- Dodano publiczne `GET /users/:username/followers?limit=20&offset=0` i `GET /users/:username/following?limit=20&offset=0`.
- Self-follow/self-unfollow zwraca `400`; brak profilu zwraca `404`; duplikat follow zwraca `409`.
- `DELETE /users/:username/follow` jest idempotentny względem braku istniejącej relacji i zwraca `204`.
- Dodano devlog `devlog/15_relationships-follows.md`.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-29 — Post edit/delete

- Dodano `UpdatePostDto` dla edycji treści posta.
- Dodano `PostsService.updateOwnPost` i `PostsService.deleteOwnPost`.
- Dodano regułę własności: tylko autor może edytować/usunąć post.
- Brak posta zwraca `404 Post not found`, próba modyfikacji cudzego posta zwraca `403 You can only modify your own posts`.
- Dodano chronione `PATCH /posts/:id` i `DELETE /posts/:id`.
- `DELETE /posts/:id` zwraca `204 No Content`.
- Dodano devlog `devlog/14_post-edit-delete.md`.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-29 — User post list pagination

- Ujednolicono `GET /users/:username/posts` z globalnym feedem przez query params `limit` i `offset`.
- `limit` ma zakres `1..50`, `offset` musi być `>= 0`.
- `PostsService.findByAuthorId` przyjmuje teraz `{ authorId, limit, offset }`.
- Lista postów użytkownika sortuje po `createdAt desc`, `id desc`.
- Dodano devlog `devlog/13_user-post-list-pagination.md`.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-29 — Global posts feed

- Dodano `ListPostsQueryDto` z walidacją `limit` (`1..50`) i `offset` (`>= 0`).
- Dodano `PostsService.findFeed({ limit, offset })`.
- Dodano publiczne `GET /posts?limit=20&offset=0`.
- Feed jest sortowany od najnowszych (`createdAt desc`, `id desc`).
- Dodano devlog `devlog/12_global-post-feed.md`.
- Nie wykonano pełnego real smoke testu z zapisem do bazy, bo komenda z cleanupem testowego użytkownika została zablokowana przez guard narzędzia; pokrycie zapewniają unit/e2e testy.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — User post list

- Dodano `PostsService.findByAuthorId`.
- Wyeksportowano `PostsService` z `PostsModule` i użyto go w `UsersModule`.
- Dodano publiczne `GET /users/:username/posts`.
- Lista postów użytkownika jest sortowana od najnowszych (`createdAt desc`).
- Dla istniejącego profilu bez postów endpoint zwraca `[]`.
- Dla brakującego profilu endpoint zwraca `404 User profile not found`.
- Dodano devlog `devlog/11_user-post-list.md`.
- Zweryfikowano lokalnie flow `register → login → POST /posts x2 → GET /users/:username/posts` na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — Text posts foundation

- Dodano model Prisma `Post` i migrację `20260627160203_add_posts`.
- Dodano `PostsModule`, `PostsService`, `PostsController` i `CreatePostDto`.
- Dodano chronione `POST /posts` i publiczne `GET /posts/:id`.
- Dodano testy jednostkowe i e2e dla tworzenia, walidacji, braku tokena, publicznego odczytu i `404`.
- Dodano devlog `devlog/10_text-posts-foundation.md`.
- Zweryfikowano lokalnie flow `register → login → POST /posts → GET /posts/:id` na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — Lightweight profile content policy

- Dodano `docs/profile-content-policy.md`.
- Ustalono, że `avatarUrl` zostaje publiczny i nie blokujemy teraz profilu automatyczną moderacją.
- Zapisano przyszły kierunek: reportowanie profilu/avatarów, ręczny review i placeholder po odrzuceniu.
- Moderacja uploadowanych avatarów zostaje na później, gdy ShareMeet będzie hostował obrazy.

Data: 2026-06-27 — Public profile foundation

- Dodano `UsersService.findByUsername`.
- Dodano publiczne `GET /users/:username`.
- Publiczny profil zwraca `id`, `username`, `displayName`, `bio`, `avatarUrl`, `isPrivate`, `createdAt`.
- Publiczny profil nie zwraca `email`, `passwordHash`, `isActive`, `updatedAt`.
- Dodano `404 User profile not found` dla brakujących profili.
- Zapisano ryzyko moderacji avatarów: `avatarUrl` jest publiczny, ale bez moderacji treści.
- Dodano devlog `devlog/09_public-profile.md`.
- Zweryfikowano lokalnie flow `register → login → PATCH /users/me → GET /users/:username` na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — User profile foundation

- Refresh token i Google OAuth przesunięto do backlogu na czas pracy nad profilem.
- Dodano `docs/auth-api.md` jako krótką dokumentację register/login/me.
- Wydzielono `JwtAccessModule` i przeniesiono `JwtAuthGuard` do `common/guards`.
- Dodano `UpdateProfileDto`, `UsersController` i chronione `PATCH /users/me`.
- Dodano `UsersService.updateProfile` dla pól `displayName`, `bio`, `avatarUrl`, `isPrivate`.
- Dodano testy jednostkowe i e2e profilu.
- Zweryfikowano lokalnie pełny flow `register → login → PATCH /users/me → GET /auth/me` na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — Auth validation/conflicts foundation

- Dodano `class-validator` i `class-transformer`.
- Dodano globalny `ValidationPipe` przez `configureApp` i podłączono go w `main.ts` oraz testach e2e.
- Dodano walidację `RegisterDto` i `LoginDto`.
- Dodano mapowanie Prisma `P2002` na przyjazne `409 Conflict` dla zajętego emaila albo username.
- Dodano ADR w `docs/decisions.md` i devlog `devlog/07_auth-validation-conflicts.md`.
- Zweryfikowano lokalnie invalid register/login, duplicate register oraz cały flow register/login/me.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — Auth me/JWT guard foundation

- Dodano `JwtAuthGuard`.
- Dodano chronione `GET /auth/me`.
- Dodano `AuthService.getCurrentUser`.
- Dodano testy jednostkowe i e2e: brak tokena → `401`, błędny token → `401`, poprawny token → publiczny użytkownik bez `passwordHash`.
- Zweryfikowano lokalnie pełny flow `register → login → me` na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — Auth login/JWT foundation

- Dodano `@nestjs/jwt`.
- Dodano `LoginDto`.
- Dodano `AuthService.login` i `POST /auth/login`.
- Login porównuje hasło z `passwordHash` i zwraca JWT access token + publicznego użytkownika bez `passwordHash`.
- Dodano testy jednostkowe i e2e dla poprawnego oraz błędnego loginu.
- Zweryfikowano lokalnie przez uruchomienie aplikacji na porcie `3001`, wykonanie register/login, sprawdzenie że błędne hasło daje `401`, a potem usunięcie testowego użytkownika.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — Auth register foundation

- Dodano `AuthModule`, `AuthService`, `AuthController` i `RegisterDto`.
- Dodano `POST /auth/register`.
- Dodano `bcryptjs` do hashowania haseł w `AuthService`.
- Dodano test jednostkowy rejestracji i test e2e dla endpointu register.
- Zweryfikowano lokalnie przez uruchomienie aplikacji na porcie `3001`, wykonanie `POST /auth/register`, sprawdzenie w PostgreSQL że hasło jest zapisane jako hash, a potem usunięcie testowego użytkownika.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — UsersService foundation

- Dodano minimalny `UsersModule` i `UsersService` korzystający z `PrismaService`.
- Dodano `CreateUserDto` jako pierwszy kontrakt wejściowy dla tworzenia użytkownika.
- Dodano testy `UsersService` dla `createUser`, `findByEmail` i `findById`.
- Podłączono `UsersModule` do `AppModule`.
- Dodano devlog `devlog/03_users-service.md` opisujący granice odpowiedzialności Users vs Auth.
- Uruchomiono `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — Prisma/User foundation

- Dodano Prisma 6 jako warstwę dostępu do PostgreSQL.
- Dodano `backend/prisma/schema.prisma` z pierwszym modelem `User`.
- Dodano i zastosowano migrację `init_user` tworzącą tabelę `users`.
- Dodano globalny `PrismaModule` i `PrismaService`.
- Zmieniono port hosta PostgreSQL w Docker Compose na `5433`, żeby uniknąć konfliktu z istniejącą lokalną bazą na `5432`.
- Dodano devlog `devlog/02_prisma-user-foundation.md` wyjaśniający wybór Prisma i pierwszy model danych.
- Uruchomiono `npm run prisma:validate`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — wszystko przechodzi.

Data: 2026-06-27 — reset auth/users

- Usunięto eksperymentalne, niespójne moduły `backend/src/auth/` i `backend/src/users/`.
- Usunięto nieużywane zależności Passport/JWT/Google OAuth z `backend/package.json` na czas czystego resetu.
- Oczyszczono `AppModule` do bazowego modułu NestJS.
- Uruchomiono `npm install`, `npm run format`, `npm run build`, `npm test` i `npm run test:e2e` w `backend/` — build i testy przechodzą.
- Przyjęto kierunek odbudowy auth/users od zera na PostgreSQL + Prisma.

Data: 2026-06-22

- Uporządkowano dokumentację projektu pod workflow AI.
- Zdecydowano, że `devlog/` pozostaje wewnątrz głównego repo.
- Osobny pusty folder/projekt `sharemeet-devlog` zarchiwizowano poza aktywnym workspace.
- Dodano `.gitignore` i `.prettierrc`.
- Zainicjalizowano lokalne repo git i przygotowano pierwszy commit.

## Następne zadania

- [x] Wybrać docelowy storage dla users/auth: PostgreSQL + Prisma.
- [x] Zaktualizować `docs/decisions.md` decyzją o resecie auth/users.
- [x] Uporządkować zależności w `backend/package.json`.
- [x] Usunąć stare `AuthModule`, `AuthController`, `AuthService`, `UsersModule`, `UsersService`, Mongoose schema, Google strategy i zdublowane JWT guardy.
- [x] Dodać Prisma i skonfigurować połączenie z PostgreSQL.
- [x] Dodać model `User` i pierwszą migrację.
- [x] Odbudować minimalne `UsersModule` i `UsersService`.
- [x] Dodać `AuthModule` z register.
- [x] Dodać login + JWT access token.
- [x] Dodać protected route / JWT guard.
- [x] Dodać minimalny smoke test auth/users.
- [x] Rozstrzygnąć walidację DTO i obsługę konfliktów email/username.
- [x] Rozstrzygnąć refresh token: backlog na razie.
- [x] Przygotować krótką dokumentację endpointów auth.
- [x] Dodać protected `PATCH /users/me` dla profilu.
- [x] Dodać publiczny odczyt profilu, np. `GET /users/:username`.
- [x] Zapisać lekką politykę avatarów / przyszłego reportowania profilu.
- [x] Dodać posty tekstowe: model `Post`, `POST /posts`, `GET /posts/:id`.
- [x] Dodać listę postów użytkownika `GET /users/:username/posts`.
- [x] Dodać prosty globalny feed `GET /posts` z paginacją `limit/offset`.
- [x] Dodać paginację dla `GET /users/:username/posts`.
- [x] Dodać edycję/usuwanie własnych postów.
- [x] Dodać relacje/friends/follows.
- [x] Dodać feed obserwowanych `GET /posts/following`.
- [x] Dodać liczniki followers/following do profilu publicznego.
- [x] Dodać widoczność/prywatność postów.
- [ ] Dodać komentarze.

## Decyzje techniczne

| Data | Decyzja | Powód |
|---|---|---|
| 2026-06-14 | PostgreSQL + MongoDB jako architektura docelowa | PostgreSQL dla relacji, MongoDB dla logów/media/notyfikacji |
| 2026-06-22 | Wprowadzamy `plan.md` + `project_state.md` + `AGENTS.md` | Jeden wspólny stan dla Hermesa, VSCode/Cline/Codex i człowieka |
| 2026-06-22 | Devlog zostaje w głównym repo jako `devlog/` | Proces nauki powinien być widoczny obok kodu i decyzji |
| 2026-06-27 | Resetujemy eksperymentalny auth/users i odbudowujemy na PostgreSQL + Prisma | Czysty start jest tańszy i bardziej edukacyjny niż naprawianie niespójnego kodu |
| 2026-06-27 | Dodajemy listę postów użytkownika | Domykamy flow publiczny profil → posty użytkownika przed globalnym feedem |
| 2026-06-29 | Dodajemy prosty globalny feed `GET /posts` z `limit/offset` | MVP potrzebuje publicznej listy najnowszych postów; offset pagination jest najprostsza edukacyjnie |
| 2026-06-29 | Ujednolicamy paginację list postów | `GET /posts` i `GET /users/:username/posts` powinny mieć ten sam kontrakt `limit/offset` |
| 2026-06-29 | Tylko autor może edytować/usunąć własny post | Minimalna reguła własności jest potrzebna przed rozbudową social features |
| 2026-06-29 | Dodajemy model `Follow` jako relację użytkownik → użytkownik | To najprostszy fundament pod feed obserwowanych i social graph |
| 2026-06-29 | Dodajemy `GET /posts/following` jako pierwszy social feed | Wykorzystujemy istniejący model `Follow`; ranking i cursor pagination zostają na później |

## Otwarte pytania

- Czy po feedzie obserwowanych najpierw dodajemy liczniki followers/following, comments, czy visibility/privacy?

## Instrukcja dla agenta

1. Nie zakładaj stanu projektu z pamięci rozmowy.
2. Przed planowaniem/kodowaniem sprawdź `AGENTS.md`, `project_state.md`, `plan.md` i `README.md`.
3. Po zmianach zaproponuj aktualizację tego pliku.
4. Jeśli odkryjesz rozjazd między kodem a dokumentacją, oznacz go jako blocker.
