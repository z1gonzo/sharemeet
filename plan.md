# Plan projektu ShareMeet

> Hermes planuje i aktualizuje ten plik. VSCode/Cline/Codex implementują małe kroki zgodnie z planem. `project_state.md` jest single source of truth aktualnego stanu.

## Cel projektu

Zbudować edukacyjny MVP social platform: konta użytkowników, auth, profil, posty, relacje/friends, a później media, powiadomienia i realtime.

Równie ważny cel: dokumentować proces nauki — dlaczego wybieramy konkretne technologie, jakie są trade-offy i czego się uczymy po drodze.

## Aktualny priorytet

Przygotować repo pod spokojną sesję kodowania w VSCode/Cline i ustabilizować fundament backendu/auth.

- [x] Ustalić, że główny projekt to `sharemeet/`, a devlog żyje w repo jako `devlog/`
- [x] Usunąć osobny pusty projekt `sharemeet-devlog` z aktywnego workspace przez archiwizację
- [x] Zainicjalizować git w głównym projekcie
- [x] Uporządkować README i pliki workflow
- [x] Podjąć decyzję: PostgreSQL/Prisma dla users/auth
- [x] Usunąć eksperymentalny, niespójny kod auth/users
- [x] Naprawić build backendu przez powrót do czystego szkieletu NestJS
- [x] Dodać Prisma i model `User`
- [x] Utworzyć pierwszą migrację PostgreSQL dla tabeli `users`
- [x] Odbudować minimalne `UsersModule` na `PrismaService`
- [x] Dodać `AuthModule` z email/password registration
- [x] Dodać minimalne testy i e2e smoke test dla auth/register
- [x] Dodać login z JWT access token
- [ ] Dodać protected route / JWT guard

## Faza 0 — Organizacja repo i workflow

- [x] Jeden główny folder/repo projektu: `sharemeet/`
- [x] Devlog jako część repo: `devlog/`
- [x] Standardowe pliki workflow: `AGENTS.md`, `README.md`, `plan.md`, `project_state.md`, `changelog.md`, `docs/*`
- [x] `.gitignore` i `.prettierrc`
- [x] Pierwszy commit lokalny

## Faza 1 — Auth Foundation

### Zakres

- [x] Backend NestJS buduje się bez błędów jako czysty szkielet po resecie eksperymentalnego auth/users
- [x] Konfiguracja env przez `@nestjs/config`
- [x] Prisma podłączona do PostgreSQL
- [x] Moduł users ma pierwszy model danych w PostgreSQL + Prisma
- [x] Minimalny `UsersModule` korzysta z `PrismaService`
- [x] Register tworzy użytkownika i nie zwraca `passwordHash`
- [x] Login zwraca access token
- [ ] Refresh token ma jasną implementację albo jest odłożony do backlogu
- [ ] Google OAuth jest poprawnie zaimplementowany albo wyłączony do czasu podstawowego JWT

### Kryteria ukończenia

- [x] `npm run build` w `backend/` przechodzi dla czystego szkieletu NestJS
- [x] `npm test` i `npm run test:e2e` przechodzą dla istniejących smoke testów aplikacji
- [x] README opisuje aktualny start backendu, baz i Prisma
- [x] `project_state.md` zawiera aktualny stan bez sprzeczności
- [x] `docs/decisions.md` zapisuje decyzję storage/reset dla users/auth

## Faza 2 — Core Social MVP

- [ ] Profil użytkownika
- [ ] Posty tekstowe
- [ ] Relacje/friends/follows
- [ ] Podstawowy frontend

## Faza 3 — Media i aktywność

- [ ] Media uploads / metadata
- [ ] Activity logs
- [ ] Notifications
- [ ] Redis/caching — dopiero jeśli potrzebne

## Backlog

- GraphQL
- WebSockets
- Kolejki/background jobs
- Feed ranking
- Zaawansowane media
- Publiczny/portfolio devlog zbudowany z `devlog/`

## Zakazane na tym etapie

- Brak GraphQL/WebSockets/queues przed działającym MVP auth
- Brak przepisywania całego projektu bez decyzji w `docs/decisions.md`
- Brak mieszania PostgreSQL/Prisma i Mongo/Mongoose dla tego samego modułu bez jasnej decyzji
- Brak osobnego `sharemeet-devlog` w aktywnym workspace, dopóki devlog nie staje się samodzielnym blogiem/produktem
