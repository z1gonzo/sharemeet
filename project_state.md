# Stan projektu ShareMeet

> Single source of truth. Hermes/Cline/Codex nie zakładają stanu z pamięci rozmowy — najpierw czytają ten plik, `plan.md`, `AGENTS.md` i `README.md`.

## Status

- Etap: Faza 2 — Core Social MVP / Posty tekstowe
- Ostatnia sesja: 2026-06-27
- Repo: lokalny git zainicjalizowany w głównym projekcie `sharemeet/`, remote ustawiony na `git@github.com:z1gonzo/sharemeet.git`
- Główne ryzyko: posty mają tylko pojedynczy odczyt; brakuje list/feedu i zasad prywatności wokół prywatnych profili
- Następny krok: dodać listę postów użytkownika `GET /users/:username/posts` albo minimalny feed `GET /posts`

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
- `PostsModule` obsługuje chronione `POST /posts` i publiczne `GET /posts/:id`.
- PostgreSQL z Docker Compose działa lokalnie na porcie hosta `5433`.
- `npm run build` w `backend/` przechodzi.
- `npm test` i `npm run test:e2e` w `backend/` przechodzą: 8 test suites, 35 testów łącznie.
- Istnieje devlog opisujący plan PostgreSQL + MongoDB: `devlog/01_db-choice.md`.
- Repo ma standardowe pliki workflow dla pracy Hermes ↔ VSCode/Cline/Codex.

## Co nie działa / wymaga naprawy

Zweryfikowane przez `npm run build && npm test && npm run test:e2e` w `backend/` na 2026-06-27:

- Brakuje listy postów użytkownika albo globalnego feedu.
- Brakuje edycji/usuwania postów.
- Brakuje relacji/friends/follows.
- Reportowanie profilu/avatarów jest świadomie w backlogu, nie w bieżącym zakresie.

## Ostatnio wykonane

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
- [ ] Dodać listę postów użytkownika albo prosty feed.

## Decyzje techniczne

| Data | Decyzja | Powód |
|---|---|---|
| 2026-06-14 | PostgreSQL + MongoDB jako architektura docelowa | PostgreSQL dla relacji, MongoDB dla logów/media/notyfikacji |
| 2026-06-22 | Wprowadzamy `plan.md` + `project_state.md` + `AGENTS.md` | Jeden wspólny stan dla Hermesa, VSCode/Cline/Codex i człowieka |
| 2026-06-22 | Devlog zostaje w głównym repo jako `devlog/` | Proces nauki powinien być widoczny obok kodu i decyzji |
| 2026-06-27 | Resetujemy eksperymentalny auth/users i odbudowujemy na PostgreSQL + Prisma | Czysty start jest tańszy i bardziej edukacyjny niż naprawianie niespójnego kodu |
| 2026-06-27 | Dodajemy fundament postów tekstowych | Minimalne `POST /posts` + `GET /posts/:id` daje pierwszy realny element social MVP bez feedu/lajków/komentarzy |

## Otwarte pytania

- Czy następny krok dla postów to `GET /users/:username/posts`, czy prosty globalny `GET /posts`?

## Instrukcja dla agenta

1. Nie zakładaj stanu projektu z pamięci rozmowy.
2. Przed planowaniem/kodowaniem sprawdź `AGENTS.md`, `project_state.md`, `plan.md` i `README.md`.
3. Po zmianach zaproponuj aktualizację tego pliku.
4. Jeśli odkryjesz rozjazd między kodem a dokumentacją, oznacz go jako blocker.
