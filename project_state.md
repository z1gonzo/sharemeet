# Stan projektu ShareMeet

> Single source of truth. Hermes/Cline/Codex nie zakładają stanu z pamięci rozmowy — najpierw czytają ten plik, `plan.md`, `AGENTS.md` i `README.md`.

## Status

- Etap: Milestone 1 — Auth Foundation
- Ostatnia sesja: 2026-06-27
- Repo: lokalny git zainicjalizowany w głównym projekcie `sharemeet/`, remote ustawiony na `git@github.com:z1gonzo/sharemeet.git`
- Główne ryzyko: auth/users jest dopiero odbudowywane; aktualnie mamy fundament Prisma + model `User`, ale bez endpointów register/login
- Następny krok: odbudować minimalny `UsersModule` na `PrismaService`, potem `AuthModule` z email/password + JWT

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
- PostgreSQL z Docker Compose działa lokalnie na porcie hosta `5433`.
- `npm run build` w `backend/` przechodzi.
- `npm test` i `npm run test:e2e` w `backend/` przechodzą: 2 test suites, 2 testy łącznie.
- Istnieje devlog opisujący plan PostgreSQL + MongoDB: `devlog/01_db-choice.md`.
- Repo ma standardowe pliki workflow dla pracy Hermes ↔ VSCode/Cline/Codex.

## Co nie działa / wymaga naprawy

Zweryfikowane przez `npm run build && npm test && npm run test:e2e` w `backend/` na 2026-06-27:

- Auth/users endpointy nie są obecnie zaimplementowane — poprzedni eksperymentalny kod został usunięty zamiast naprawiany.
- Brakuje minimalnego `UsersModule` korzystającego z `PrismaService`.
- Brakuje register/login/JWT.
- Brakuje smoke testu dla auth/users.

## Ostatnio wykonane

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
- [ ] Odbudować minimalne `UsersModule` i `AuthModule`.
- [ ] Dodać register/login + JWT access token.
- [ ] Dodać minimalny smoke test auth/users.

## Decyzje techniczne

| Data | Decyzja | Powód |
|---|---|---|
| 2026-06-14 | PostgreSQL + MongoDB jako architektura docelowa | PostgreSQL dla relacji, MongoDB dla logów/media/notyfikacji |
| 2026-06-22 | Wprowadzamy `plan.md` + `project_state.md` + `AGENTS.md` | Jeden wspólny stan dla Hermesa, VSCode/Cline/Codex i człowieka |
| 2026-06-22 | Devlog zostaje w głównym repo jako `devlog/` | Proces nauki powinien być widoczny obok kodu i decyzji |
| 2026-06-27 | Resetujemy eksperymentalny auth/users i odbudowujemy na PostgreSQL + Prisma | Czysty start jest tańszy i bardziej edukacyjny niż naprawianie niespójnego kodu |
| 2026-06-27 | Dodajemy Prisma 6 i pierwszy model `User` | Popularny, typowany workflow PostgreSQL dla Node.js/TypeScript/NestJS |

## Otwarte pytania

- Czy Google OAuth robimy w późniejszej części Milestone 1, czy przesuwamy do `v0.2-auth`?
- Czy refresh token implementujemy od razu po access token, czy jako osobny krok po działającym register/login?
- Czy frontend formalnie ustawiamy jako Next.js + React + TailwindCSS już teraz, czy dopiero po backend auth?

## Instrukcja dla agenta

1. Nie zakładaj stanu projektu z pamięci rozmowy.
2. Przed planowaniem/kodowaniem sprawdź `AGENTS.md`, `project_state.md`, `plan.md` i `README.md`.
3. Po zmianach zaproponuj aktualizację tego pliku.
4. Jeśli odkryjesz rozjazd między kodem a dokumentacją, oznacz go jako blocker.
