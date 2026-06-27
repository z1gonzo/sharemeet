# Stan projektu ShareMeet

> Single source of truth. Hermes/Cline/Codex nie zakładają stanu z pamięci rozmowy — najpierw czytają ten plik, `plan.md`, `AGENTS.md` i `README.md`.

## Status

- Etap: Milestone 1 — Auth Foundation
- Ostatnia sesja: 2026-06-27
- Repo: lokalny git zainicjalizowany w głównym projekcie `sharemeet/`, remote ustawiony na `git@github.com:z1gonzo/sharemeet.git`
- Główne ryzyko: auth foundation działa w minimalnym zakresie, ale refresh token i walidacja DTO nie są jeszcze rozstrzygnięte
- Następny krok: zdecydować refresh token vs backlog, potem dodać DTO validation i obsługę konfliktów email/username

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
- Istnieje pierwszy model `User` w `backend/prisma/schema.prisma`.
- Istnieje i została zastosowana migracja `init_user` tworząca tabelę `users`.
- `PrismaModule` i `PrismaService` są dodane do backendu.
- Minimalny `UsersModule` i `UsersService` obsługują tworzenie użytkownika oraz wyszukiwanie po email/id.
- `AuthModule` obsługuje `POST /auth/register`, hashuje hasło i nie zwraca `passwordHash` w odpowiedzi.
- `AuthModule` obsługuje `POST /auth/login`, porównuje hasło i zwraca JWT access token.
- `AuthModule` obsługuje chronione `GET /auth/me` przez `JwtAuthGuard`.
- PostgreSQL z Docker Compose działa lokalnie na porcie hosta `5433`.
- `npm run build` w `backend/` przechodzi.
- `npm test` i `npm run test:e2e` w `backend/` przechodzą: 5 test suites, 16 testów łącznie.
- Istnieje devlog opisujący plan PostgreSQL + MongoDB: `devlog/01_db-choice.md`.
- Repo ma standardowe pliki workflow dla pracy Hermes ↔ VSCode/Cline/Codex.

## Co nie działa / wymaga naprawy

Zweryfikowane przez `npm run build && npm test && npm run test:e2e` w `backend/` na 2026-06-27:

- Refresh token nie jest jeszcze zaimplementowany ani formalnie przesunięty do backlogu.
- Brakuje walidacji DTO dla register/login.
- Brakuje przyjaznej obsługi konfliktów unikalności email/username.

## Ostatnio wykonane

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
- [ ] Rozstrzygnąć refresh token: backlog albo prosty flow.
- [ ] Dodać DTO validation i obsługę konfliktów email/username.

## Decyzje techniczne

| Data | Decyzja | Powód |
|---|---|---|
| 2026-06-14 | PostgreSQL + MongoDB jako architektura docelowa | PostgreSQL dla relacji, MongoDB dla logów/media/notyfikacji |
| 2026-06-22 | Wprowadzamy `plan.md` + `project_state.md` + `AGENTS.md` | Jeden wspólny stan dla Hermesa, VSCode/Cline/Codex i człowieka |
| 2026-06-22 | Devlog zostaje w głównym repo jako `devlog/` | Proces nauki powinien być widoczny obok kodu i decyzji |
| 2026-06-27 | Resetujemy eksperymentalny auth/users i odbudowujemy na PostgreSQL + Prisma | Czysty start jest tańszy i bardziej edukacyjny niż naprawianie niespójnego kodu |
| 2026-06-27 | Dodajemy protected `GET /auth/me` przez `JwtAuthGuard` | Domykamy minimalny flow `register → login → token → me` przed decyzją o refresh tokenie |

## Otwarte pytania

- Czy Google OAuth robimy w późniejszej części Milestone 1, czy przesuwamy do `v0.2-auth`?
- Czy refresh token implementujemy od razu po access token, czy jako osobny krok po działającym register/login?
- Czy frontend formalnie ustawiamy jako Next.js + React + TailwindCSS już teraz, czy dopiero po backend auth?

## Instrukcja dla agenta

1. Nie zakładaj stanu projektu z pamięci rozmowy.
2. Przed planowaniem/kodowaniem sprawdź `AGENTS.md`, `project_state.md`, `plan.md` i `README.md`.
3. Po zmianach zaproponuj aktualizację tego pliku.
4. Jeśli odkryjesz rozjazd między kodem a dokumentacją, oznacz go jako blocker.
