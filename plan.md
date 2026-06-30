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
- [x] Dodać protected route / JWT guard
- [x] Dodać DTO validation i obsługę konfliktów email/username
- [x] Rozstrzygnąć refresh token: backlog na razie
- [x] Dodać krótką dokumentację endpointów auth

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
- [x] Register/login mają walidację DTO
- [x] Duplicate email/username zwraca czytelne `409 Conflict`
- [x] Refresh token jest odłożony do backlogu
- [x] Google OAuth jest wyłączony do czasu stabilnego podstawowego JWT/profile flow

### Kryteria ukończenia

- [x] `npm run build` w `backend/` przechodzi dla czystego szkieletu NestJS
- [x] `npm test` i `npm run test:e2e` przechodzą dla istniejących smoke testów aplikacji
- [x] README opisuje aktualny start backendu, baz i Prisma
- [x] `project_state.md` zawiera aktualny stan bez sprzeczności
- [x] `docs/decisions.md` zapisuje decyzję storage/reset dla users/auth

## Faza 2 — Core Social MVP

- [ ] Profil użytkownika
  - [x] Dodać protected `PATCH /users/me` dla pól profilu
  - [x] Dodać walidację DTO profilu
  - [x] Dodać testy e2e profilu
  - [x] Dodać publiczny odczyt profilu, np. `GET /users/:username`
  - [x] Zapisać lekką politykę avatarów / przyszłego reportowania profilu
- [ ] Posty tekstowe
  - [x] Dodać model `Post` i migrację PostgreSQL
  - [x] Dodać protected `POST /posts`
  - [x] Dodać publiczne `GET /posts/:id`
  - [x] Dodać listę postów użytkownika `GET /users/:username/posts`
  - [x] Dodać prosty globalny feed `GET /posts` z paginacją `limit/offset`
  - [x] Dodać paginację dla `GET /users/:username/posts`
  - [x] Dodać edycję/usuwanie własnych postów
- [x] Relacje/friends/follows
  - [x] Dodać `Follow` jako relację użytkownik → użytkownik
  - [x] Dodać follow/unfollow
  - [x] Dodać listy followers/following
  - [x] Dodać feed obserwowanych
  - [x] Dodać liczniki followers/following na profilu
  - [x] Dodać `isFollowing` na profilu publicznym
- [x] Komentarze
- [x] Liczniki komentarzy na postach
- [x] Endpoint „moje posty” dla własnych prywatnych treści
- [x] Widoczność/prywatność postów
- [x] Wybrać kierunek frontend UI na bazie mockupów: Focus Dark social-tech
- [ ] Podstawowy frontend
  - [x] Utworzyć `frontend/` jako Vite + React + TypeScript
  - [x] Dodać Focus Dark app shell na mockowanych danych
  - [x] Dodać mockowany feed/profile/post card/comments preview
  - [x] Dodać login/register screens
  - [x] Podłączyć auth API: register, login, token, `GET /auth/me`, logout
  - [ ] Podłączyć global feed `GET /posts`
  - [ ] Podłączyć tworzenie posta `POST /posts`
  - [ ] Podłączyć profile/follow/comments

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
