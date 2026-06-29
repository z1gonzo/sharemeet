# Decyzje techniczne ShareMeet

> Lekki ADR log. Większe decyzje technologiczne zapisujemy tutaj, żeby Hermes/Cline/Codex nie zgadywały kontekstu.

## 2026-06-14 — PostgreSQL + MongoDB jako kierunek docelowy

Status: accepted

### Kontekst

ShareMeet ma mieć dane relacyjne oraz elastyczne dokumenty/logi.

### Decyzja

- PostgreSQL dla danych relacyjnych: users, friends, posts, comments.
- MongoDB dla elastycznych dokumentów: media uploads, activity logs, notifications.

### Konsekwencje

- MVP auth/users powinien trzymać się jednej decyzji storage.
- Jeśli users/auth przejdzie na MongoDB, trzeba jawnie zaktualizować plan i devlog.

---

## 2026-06-22 — Standard workflow AI dla projektu

Status: accepted

### Kontekst

Projekt będzie rozwijany z pomocą Hermesa, VSCode/Cline/Codex. Potrzebny jest jeden stan prawdy.

### Decyzja

Dodajemy i utrzymujemy:

- `AGENTS.md`
- `plan.md`
- `project_state.md`
- `changelog.md`
- `docs/architecture.md`
- `docs/decisions.md`
- `devlog/`

### Konsekwencje

- Hermes planuje i synchronizuje stan.
- VSCode/Cline/Codex implementują konkretne taski.
- Agent nie zakłada stanu z pamięci rozmowy.

---

## 2026-06-22 — Devlog wewnątrz głównego repo

Status: accepted

### Kontekst

Istniał osobny pusty folder/projekt `sharemeet-devlog`, ale realna dokumentacja procesu nauki była już w `sharemeet/devlog/`.

### Decyzja

Devlog zostaje w głównym repo jako `devlog/`. Osobny projekt `sharemeet-devlog` usuwamy z aktywnego workspace przez archiwizację.

### Konsekwencje

- Kod, decyzje i proces nauki są commitowane razem.
- Historia git pokazuje nie tylko wynik, ale też tok rozumowania.
- Osobne repo/blog można wydzielić później, jeśli devlog ma stać się samodzielnym materiałem publicznym.

---

## 2026-06-27 — Prisma 6 jako data access layer dla PostgreSQL

Status: accepted

### Kontekst

Po resecie auth/users potrzebny jest pierwszy stabilny fundament danych. Users/auth są relacyjne i będą później łączyć się z friends, posts i comments.

### Decyzja

- Używamy Prisma 6 z PostgreSQL dla danych relacyjnych.
- Pierwszy model to `User` w `backend/prisma/schema.prisma`.
- Prisma Client jest udostępniany w NestJS przez globalny `PrismaModule` i `PrismaService`.
- PostgreSQL w lokalnym Docker Compose działa na porcie hosta `5433`, ponieważ `5432` jest już zajęty przez inną lokalną bazę.

### Konsekwencje

- Migracje Prisma stają się częścią historii projektu.
- Kolejne moduły users/auth korzystają z `PrismaService`, nie z Mongoose.
- MongoDB pozostaje na późniejsze dokumentowe przypadki użycia.
- Prisma 7 odkładamy na później, bo wymaga nowszej konfiguracji datasource/client; Prisma 6 daje stabilniejszy, popularny workflow edukacyjny.

---

## 2026-06-27 — class-validator/class-transformer dla kontraktów HTTP

Status: accepted

### Kontekst

Po dodaniu register/login/me backend potrzebuje jawnej walidacji wejścia HTTP. Bez tego kontrolery przyjmowały dowolne payloady, a błędy trafiały głębiej do serwisów lub bazy.

### Decyzja

- Używamy `class-validator` i `class-transformer` dla DTO NestJS.
- Globalna konfiguracja aplikacji używa `ValidationPipe` z `whitelist`, `forbidNonWhitelisted` i `transform`.
- Testy e2e używają tej samej konfiguracji przez `configureApp`.

### Konsekwencje

- Nieznane pola w payloadzie są odrzucane.
- Register/login zwracają `400 Bad Request` dla niepoprawnych danych.
- DTO stają się publicznym kontraktem HTTP.

---

## 2026-06-27 — Refresh token i Google OAuth w backlogu na czas profilu

Status: accepted

### Kontekst

Minimalny flow auth działa: register, login, access token, `GET /auth/me`, walidacja DTO i konflikty `409`. Użytkownik chce na razie zostawić frontend i przejść do profilu użytkownika.

### Decyzja

- Nie implementujemy teraz refresh tokena.
- Nie wracamy teraz do Google OAuth.
- Auth foundation traktujemy jako wystarczający do rozpoczęcia profilu użytkownika.
- Sesje długotrwałe i social login wrócą, gdy frontend albo wymagania produktu stworzą realną potrzebę.

### Konsekwencje

- Obecny auth jest prostszy i łatwiejszy do testowania.
- Access token pozostaje krótkotrwały.
- Kolejny kierunek backendu to profil użytkownika, zaczynając od `PATCH /users/me` i publicznego odczytu profilu.

---

## 2026-06-27 — Reset eksperymentalnego auth/users i PostgreSQL + Prisma dla MVP

Status: accepted

### Kontekst

Backend miał eksperymentalny kod auth/users, który mieszał kilka kierunków naraz:

- Mongoose/MongoDB dla users,
- plan PostgreSQL dla users/auth,
- Google OAuth przed działającym email/password JWT,
- zdublowane JWT guardy,
- placeholderowe metody i niespójne zależności.

Kod nie budował się i był gorszą bazą do nauki niż czysty start.

### Decyzja

- Usuwamy eksperymentalną implementację `backend/src/auth/` i `backend/src/users/`.
- Przyjmujemy, że MVP users/auth będzie odbudowane od zera na PostgreSQL + Prisma.
- MongoDB zostaje w architekturze docelowej jako późniejsze miejsce na media uploads, activity logs i notifications.
- Google OAuth wróci dopiero po stabilnym email/password + JWT.

### Konsekwencje

- Obecny backend wraca do czystego szkieletu NestJS, który ma przechodzić `npm run build` i `npm test`.
- Kolejne zadanie to dodanie Prisma, modelu `User`, migracji i minimalnego auth.
- Nie próbujemy ratować starego kodu Mongoose/Passport/Google OAuth.

---

## 2026-06-29 — Offset pagination dla pierwszego globalnego feedu

Status: accepted

### Kontekst

Po dodaniu postów tekstowych i listy postów użytkownika potrzebny jest publiczny globalny feed. To nadal edukacyjny MVP, więc prostota i czytelność są ważniejsze niż docelowa skalowalność feedu.

### Decyzja

- Dodajemy publiczne `GET /posts`.
- Używamy query params `limit` i `offset`.
- Domyślne wartości: `limit=20`, `offset=0`.
- `limit` ograniczamy do `1..50`.
- Sortujemy po `createdAt desc` i `id desc` jako stabilny tie-breaker.

### Konsekwencje

- Endpoint jest łatwy do testowania i użycia w przyszłym frontendzie.
- Przy większych danych offset pagination może być mniej wydajna i mniej stabilna niż cursor pagination.
- Cursor-based feed i ranking zostają na późniejszy etap, kiedy pojawi się realna potrzeba.

---

## 2026-06-29 — Wspólny kontrakt paginacji dla list postów

Status: accepted

### Kontekst

Po dodaniu `GET /posts?limit=20&offset=0` endpoint `GET /users/:username/posts` nadal zwracał całą listę postów użytkownika. To tworzyło niespójność API i przyszły dług techniczny.

### Decyzja

- `GET /users/:username/posts` używa tych samych query params co globalny feed: `limit` i `offset`.
- Wspólna walidacja żyje w `ListPostsQueryDto`.
- Domyślne wartości: `limit=20`, `offset=0`.
- Sortowanie: `createdAt desc`, `id desc`.

### Konsekwencje

- Oba list endpoints są łatwiejsze do użycia przez przyszły frontend.
- Nadal nie zwracamy `totalCount` ani metadanych paginacji.
- Cursor-based pagination pozostaje późniejszą optymalizacją.

---

## 2026-06-29 — Autor posta jako jedyny właściciel modyfikacji

Status: accepted

### Kontekst

Po dodaniu tworzenia i listowania postów potrzebne są podstawowe operacje zarządzania treścią: edycja i usunięcie. Bez reguły własności dowolny zalogowany użytkownik mógłby modyfikować cudze posty.

### Decyzja

- Dodajemy `PATCH /posts/:id` i `DELETE /posts/:id`.
- Oba endpointy wymagają JWT access tokena.
- Tylko autor posta może go edytować albo usunąć.
- Brak posta zwraca `404 Post not found`.
- Próba modyfikacji cudzego posta zwraca `403 You can only modify your own posts`.
- `DELETE /posts/:id` zwraca `204 No Content`.

### Konsekwencje

- Posty tekstowe mają podstawowy CRUD dla autora.
- Nie dodajemy jeszcze soft delete, historii edycji ani uprawnień moderatora.
- Przed relacjami/follows mamy zamknięty podstawowy zakres zarządzania własnymi postami.

---

## 2026-06-29 — `Follow` jako kierunkowa relacja użytkownik → użytkownik

Status: accepted

### Kontekst

Po dodaniu profili i postów globalny feed nadal nie ma social graphu. Najprostszy fundament pod feed obserwowanych to relacja kierunkowa: jeden użytkownik obserwuje drugiego.

### Decyzja

- Dodajemy model Prisma `Follow` mapowany na tabelę `follows`.
- Relacja ma `followerId` i `followingId`.
- Para `(followerId, followingId)` jest unikalna.
- Kasowanie użytkownika kaskadowo usuwa powiązane follows.
- Dodajemy chronione `POST /users/:username/follow` i `DELETE /users/:username/follow`.
- Dodajemy publiczne listy `GET /users/:username/followers` i `GET /users/:username/following` z `limit/offset`.
- `DELETE /users/:username/follow` jest idempotentne, gdy relacja nie istnieje.

### Konsekwencje

- Można zbudować feed obserwowanych przez filtr po `followingId` aktualnego użytkownika.
- Nie obsługujemy jeszcze kont prywatnych jako request/approval workflow.
- Nie dodajemy jeszcze liczników followers/following ani pola `isFollowing` na profilu.

---

## 2026-06-29 — Feed obserwowanych jako filtrowany feed postów

Status: accepted

### Kontekst

Po dodaniu modelu `Follow` globalny feed nadal pokazuje wszystkich. Pierwszy social feed powinien używać istniejącego grafu obserwacji bez dodawania rankingu ani nowego modelu.

### Decyzja

- Dodajemy chronione `GET /posts/following`.
- Endpoint używa tych samych query params co globalny feed: `limit` i `offset`.
- Feed zawiera posty autorów, których aktualny użytkownik obserwuje.
- Nie mieszamy automatycznie własnych postów użytkownika do feedu obserwowanych.
- Sortowanie pozostaje `createdAt desc`, `id desc`.
- Ranking, cursor pagination i prywatność widoczności postów są odłożone.

### Konsekwencje

- Backend ma teraz publiczny globalny feed i chroniony social feed.
- Przyszły frontend może rozdzielić widoki „global” i „following”.
- Przy większej skali trzeba będzie wrócić do cursor pagination i ewentualnie denormalizacji feedu.

---

## 2026-06-29 — Liczniki followers/following przez Prisma `_count`

Status: accepted

### Decyzja

- `GET /users/:username` zwraca `followersCount` i `followingCount`.
- Liczniki liczymy przez Prisma `_count` na relacjach `followers` i `following`.
- Nie denormalizujemy liczników w tabeli `users` na tym etapie.

### Konsekwencje

- Brak nowej migracji i brak ryzyka niespójnych liczników.
- Przy dużej skali można wrócić do denormalizacji lub cache.
