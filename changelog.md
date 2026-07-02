# Changelog ShareMeet

> Ludzki skrót istotnych zmian. Szczegółowa historia techniczna jest w git log.

## 2026-07-02 — Deterministic demo seed data

- Dodano `backend/scripts/seed-demo.ts` i backendowy script `npm run seed:demo`.
- Seed tworzy stałe demo konta `z1gonzo`, `maria`, `adam`, `kasia` z hasłem `DemoPass123!`.
- Seed dodaje/upsertuje demo posty, follow relacje i komentarze bez duplikowania records przy kolejnym uruchomieniu.
- Zweryfikowano `npm run build`, dwukrotne `npm run seed:demo` i liczniki demo danych w DB.

## 2026-07-01 — Frontend owner edit/delete actions

- Dodano helpery API `updatePost`, `deletePost`, `updateComment`, `deleteComment`.
- `PostCard` pokazuje `Edit`/`Delete` tylko autorowi posta albo komentarza.
- Edycja posta obsługuje `content` i `visibility`; edycja komentarza obsługuje `content`.
- Zweryfikowano realnym smoke testem API + UI: edit/delete posta i komentarza działają, konsola JS bez błędów.

## 2026-07-01 — Frontend profile posts preview

- Dodano `getUserPosts(username)` dla `GET /users/:username/posts?limit=3&offset=0`.
- Prawy panel profilu pokazuje sekcję `RECENT POSTS` z maks. 3 postami Marii.
- Preview pokazuje skróconą treść, `visibility` i `commentsCount` oraz ma loading/error/empty state.
- Zweryfikowano buildami frontend/backend oraz smoke testem API + UI.

## 2026-07-01 — Frontend profile/follow API integration

- Podłączono prawy panel profilu do `GET /users/maria`.
- Dodano `ApiPublicProfile`, `getUserProfile()`, `followUser()` i `unfollowUser()` w `frontend/src/api.ts`.
- Przycisk `Follow` / `Following` wykonuje `POST /users/:username/follow` i `DELETE /users/:username/follow` z JWT.
- Zweryfikowano realnym smoke testem: UI i API poprawnie zmieniają `isFollowing`; konsola JS bez błędów.

## 2026-07-01 — Frontend comments API integration

- Podłączono panel komentarzy do `GET /posts/:postId/comments?limit=20&offset=0`.
- Dodano formularz komentarza przez `POST /posts/:postId/comments` z JWT access tokenem.
- Dodano `ApiComment`, `getPostComments()` i `createComment()` w `frontend/src/api.ts`.
- Zweryfikowano realnym smoke testem: komentarz z API pojawił się w UI, komentarz dodany z UI pojawił się w API; konsola JS bez błędów.

## 2026-06-30 — Frontend My posts API integration

- Podłączono zakładkę `My posts` do `GET /posts/me?limit=20&offset=0`.
- Dodano osobny stan listy, loading/error/ready, auth guard i refresh aktywnej zakładki.
- `My posts` pokazuje własne `PUBLIC`/`FOLLOWERS`/`PRIVATE` posty z backendu.
- Zweryfikowano realnym smoke testem: prywatny post utworzony przez UI pojawił się w `My posts`, ale nie w globalnym `GET /posts`; konsola JS bez błędów.

## 2026-06-30 — Frontend post composer API integration

- Podłączono composer do realnego `POST /posts` z JWT access tokenem.
- Brak tokena otwiera login i pokazuje komunikat zamiast tworzyć lokalnego mocka.
- Dodano loading/success/error feedback oraz blokadę kontrolek podczas publikowania.
- Po publicznym poście frontend odświeża realny `GET /posts` feed.
- Zweryfikowano realnym smoke testem przez UI: klik `Publish` utworzył post w backendzie i pokazał go w feedzie; konsola JS bez błędów.

## 2026-06-30 — Frontend global feed API integration

- Podłączono frontendowy `Global` feed do `GET /posts?limit=20&offset=0`.
- Dodano typy `ApiPost`/`ApiPostAuthor`, loading/error state, status `Live from API` i przycisk Refresh.
- Karty postów pokazują realne `visibility` i `commentsCount` z backendu.
- Zweryfikowano realnym smoke testem: publiczny post utworzony przez API pojawił się na froncie, brak błędów JS.

## 2026-06-30 — Frontend auth API integration

- Podłączono frontendowe Login/Register do realnego backend API.
- Dodano `frontend/src/api.ts` dla `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- JWT access token jest zapisywany w `localStorage` jako `sharemeet.accessToken`.
- Sidebar pokazuje zalogowanego użytkownika, a Logout usuwa token.
- Backend dostał lokalny CORS dla Vite dev servera.
- Zweryfikowano realnym smoke testem przez UI: register, token, `GET /auth/me` `200`, logout i ponowny login.

## 2026-06-30 — Frontend auth screens

- Dodano mockowane ekrany Login/Register w istniejącym froncie Focus Dark.
- Panel pokazuje kontrakt backendu: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- Dodano mock submit status dla przyszłej integracji API.
- Zweryfikowano `frontend`: `npm run build` przechodzi, brak błędów JS w konsoli przeglądarki.

## 2026-06-30 — Frontend shell

- Dodano `frontend/` jako Vite + React + TypeScript app.
- Zaimplementowano pierwszy mockowany Focus Dark shell: sidebar, feed, composer, post cards, comments preview, profile/context panel.
- Dodano `frontend/README.md` i `devlog/24_frontend-shell.md`.
- Zweryfikowano `frontend`: `npm run build` przechodzi, aplikacja renderuje się lokalnie przez Vite.

## 2026-06-30 — Frontend design direction

- Przygotowano 3 mockupy HTML w `sketches/`: Clean, Focus Dark, Local Community.
- Wybrano Focus Dark jako bazę wizualną pod portfolio/rekrutacyjny charakter projektu.
- Dodano `docs/frontend-design.md` z wytycznymi: premium dark social-tech UI inspirowany Linear/Vercel, z czytelnością Clean i lekkimi community akcentami.
- Mockupy pozostają referencją przed startem produkcyjnego frontendu.
- Dodano devlog `devlog/23_frontend-design-direction.md`.

## 2026-06-29 — Profile isFollowing

- Dodano `isFollowing` do `GET /users/:username`.
- Dla poprawnego opcjonalnego bearer tokena backend sprawdza relację `Follow` aktualnego użytkownika do profilu.
- Bez tokena albo z niepoprawnym tokenem publiczny profil dalej zwraca `200`, a `isFollowing` wynosi `false`.
- Dodano devlog `devlog/22_profile-is-following.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — My posts endpoint

- Dodano chronione `GET /posts/me?limit=20&offset=0`.
- Endpoint zwraca własne posty aktualnego użytkownika we wszystkich widocznościach: `PUBLIC`, `FOLLOWERS`, `PRIVATE`.
- Używa istniejącego kształtu odpowiedzi posta, w tym `visibility` i `commentsCount`.
- Dodano devlog `devlog/21_my-posts.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — Post comments count

- Dodano `commentsCount` do publicznych odpowiedzi z postami.
- Licznik jest wyliczany przez Prisma `_count.comments`, bez nowej migracji i bez denormalizacji.
- Dotyczy feedów, publicznego odczytu posta, tworzenia/edycji posta oraz `GET /users/:username/posts`.
- Dodano devlog `devlog/20_post-comments-count.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — Comments

- Dodano model Prisma `Comment` i migrację `20260629162741_add_comments`.
- Dodano `POST /posts/:postId/comments` i `GET /posts/:postId/comments?limit=20&offset=0`.
- Dodano `PATCH /comments/:id` i `DELETE /comments/:id` dla autora komentarza.
- Lista komentarzy jest publiczna tylko dla publicznych postów i sortuje `createdAt asc, id asc`.
- Dodano devlog `devlog/19_comments.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — Post visibility

- Dodano `PostVisibility`: `PUBLIC`, `FOLLOWERS`, `PRIVATE`.
- Dodano migrację `20260629160111_add_post_visibility`.
- `POST /posts` i `PATCH /posts/:id` obsługują opcjonalne `visibility`.
- Publiczne feedy/listy pokazują tylko `PUBLIC`; following feed pokazuje `PUBLIC` i `FOLLOWERS` od obserwowanych autorów.
- Publiczne `GET /posts/:id` ukrywa niepubliczne posty jako `404`.
- Dodano devlog `devlog/18_post-visibility.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — Profile follow counts

- `GET /users/:username` zwraca teraz `followersCount` i `followingCount`.
- Dodano `UsersService.findPublicProfileByUsername` z Prisma `_count`.
- Dodano devlog `devlog/17_profile-follow-counts.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — Following feed

- Dodano `PostsService.findFollowingFeed`.
- Dodano chronione `GET /posts/following?limit=20&offset=0`.
- Feed obserwowanych zwraca posty autorów, których aktualny użytkownik obserwuje przez model `Follow`.
- Endpoint używa istniejących query params `limit` i `offset` oraz sortowania `createdAt desc`, `id desc`.
- Dodano devlog `devlog/16_following-feed.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — Relationships/follows

- Dodano model Prisma `Follow` i migrację `20260629123023_add_follows`.
- Dodano `ListUsersQueryDto` dla paginacji list followers/following.
- Dodano chronione `POST /users/:username/follow` i `DELETE /users/:username/follow`.
- Dodano publiczne `GET /users/:username/followers?limit=20&offset=0` i `GET /users/:username/following?limit=20&offset=0`.
- Self-follow/self-unfollow zwraca `400`, brak profilu `404`, duplikat follow `409`.
- `DELETE /users/:username/follow` zwraca `204` i jest idempotentny względem braku istniejącej relacji.
- Dodano devlog `devlog/15_relationships-follows.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — Post edit/delete

- Dodano `UpdatePostDto` dla edycji treści posta.
- Dodano chronione `PATCH /posts/:id` i `DELETE /posts/:id`.
- Tylko autor posta może go edytować albo usunąć.
- Brak posta zwraca `404 Post not found`, a próba modyfikacji cudzego posta zwraca `403 You can only modify your own posts`.
- `DELETE /posts/:id` zwraca `204 No Content`.
- Dodano devlog `devlog/14_post-edit-delete.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — User post list pagination

- Ujednolicono `GET /users/:username/posts` z globalnym feedem przez query params `limit` i `offset`.
- `limit` ma zakres `1..50`, `offset` musi być `>= 0`; błędne query params zwracają `400`.
- `PostsService.findByAuthorId` przyjmuje teraz `{ authorId, limit, offset }`.
- Lista postów użytkownika sortuje po `createdAt desc`, `id desc`.
- Dodano devlog `devlog/13_user-post-list-pagination.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-29 — Global posts feed

- Dodano `ListPostsQueryDto` dla query params `limit` i `offset`.
- Dodano publiczne `GET /posts?limit=20&offset=0`.
- Feed zwraca posty od najnowszych (`createdAt desc`, `id desc`).
- `limit` ma zakres `1..50`, `offset` musi być `>= 0`; błędne query params zwracają `400`.
- Dodano devlog `devlog/12_global-post-feed.md`.
- Nie wykonano pełnego real smoke testu z zapisem do bazy, bo komenda z cleanupem testowego użytkownika została zablokowana przez guard narzędzia; pokrycie zapewniają unit/e2e testy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — User post list

- Dodano `PostsService.findByAuthorId`.
- Dodano publiczne `GET /users/:username/posts`.
- Lista postów użytkownika jest sortowana od najnowszych (`createdAt desc`).
- Dla istniejącego profilu bez postów endpoint zwraca `[]`.
- Dla brakującego profilu endpoint zwraca `404 User profile not found`.
- Dodano devlog `devlog/11_user-post-list.md`.
- Zweryfikowano realny flow `register → login → POST /posts x2 → GET /users/:username/posts` lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Text posts foundation

- Dodano model Prisma `Post` i migrację `20260627160203_add_posts`.
- Dodano `PostsModule`, `PostsService`, `PostsController` i `CreatePostDto`.
- Dodano chronione `POST /posts` i publiczne `GET /posts/:id`.
- Dodano testy jednostkowe i e2e dla tworzenia, walidacji, braku tokena, publicznego odczytu i `404`.
- Dodano devlog `devlog/10_text-posts-foundation.md`.
- Zweryfikowano realny flow `register → login → POST /posts → GET /posts/:id` lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Lightweight profile content policy

- Dodano `docs/profile-content-policy.md`.
- Ustalono, że publiczny `avatarUrl` zostaje i nie blokujemy MVP automatyczną moderacją avatarów.
- Przyszłe reportowanie profilu/avatarów zapisano jako backlog, nie bieżący zakres.
- Rekomendowany późniejszy fallback: report → ręczny review → usunięcie avatara/placeholder.

## 2026-06-27 — Public profile foundation

- Dodano `UsersService.findByUsername`.
- Dodano publiczne `GET /users/:username`.
- Publiczny profil nie zwraca `email`, `passwordHash`, `isActive`, `updatedAt`.
- Zapisano ryzyko moderacji avatarów: `avatarUrl` jest publiczny, ale bez moderacji treści.
- Dodano devlog `devlog/09_public-profile.md`.
- Zweryfikowano realny flow `register → login → PATCH /users/me → GET /users/:username` lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — User profile foundation

- Refresh token i Google OAuth przesunięto do backlogu.
- Dodano `docs/auth-api.md`.
- Wydzielono `JwtAccessModule` i przeniesiono `JwtAuthGuard` do `common/guards`.
- Dodano `UpdateProfileDto`, `UsersController`, `UsersService.updateProfile` i chronione `PATCH /users/me`.
- Dodano testy jednostkowe i e2e profilu.
- Zweryfikowano realny flow `register → login → PATCH /users/me → GET /auth/me` lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Auth validation/conflicts foundation

- Dodano `class-validator` i `class-transformer`.
- Dodano wspólną konfigurację `configureApp` z globalnym `ValidationPipe`.
- Dodano walidację `RegisterDto` i `LoginDto`.
- Dodano przyjazne `409 Conflict` dla zajętego emaila albo username.
- Dodano devlog `devlog/07_auth-validation-conflicts.md` i ADR w `docs/decisions.md`.
- Zweryfikowano realnie invalid register/login, duplicate register oraz flow register/login/me lokalnie na porcie `3001`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Auth me/JWT guard foundation

- Dodano `JwtAuthGuard`.
- Dodano chronione `GET /auth/me`.
- Dodano `AuthService.getCurrentUser`.
- Dodano testy jednostkowe i e2e dla braku tokena, błędnego tokena i poprawnego tokena.
- Zweryfikowano realny flow `register → login → me` lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Auth login/JWT foundation

- Dodano `@nestjs/jwt`.
- Dodano `LoginDto`, `AuthService.login` i `POST /auth/login`.
- Login porównuje hasło z `passwordHash` i zwraca JWT access token oraz publicznego użytkownika bez `passwordHash`.
- Dodano testy jednostkowe i e2e dla poprawnego i błędnego loginu.
- Zweryfikowano realny endpoint lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy po sprawdzeniu.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Auth register foundation

- Dodano `AuthModule`, `AuthService`, `AuthController` i `RegisterDto`.
- Dodano `POST /auth/register`.
- Dodano `bcryptjs` do hashowania haseł.
- Dodano test jednostkowy dla `AuthService.register` i test e2e dla `POST /auth/register`.
- Zweryfikowano realny endpoint lokalnie na porcie `3001`; testowy użytkownik został usunięty z bazy po sprawdzeniu.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — UsersService foundation

- Dodano minimalny `UsersModule` i `UsersService` korzystający z `PrismaService`.
- Dodano `CreateUserDto`.
- Dodano testy `UsersService` dla `createUser`, `findByEmail` i `findById`.
- Podłączono `UsersModule` do `AppModule`.
- Dodano devlog `devlog/03_users-service.md`.
- Zweryfikowano `backend`: `npm run lint`, `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — Prisma/User foundation

- Dodano Prisma 6 (`prisma`, `@prisma/client`) jako data access layer dla PostgreSQL.
- Dodano `backend/prisma/schema.prisma` z modelem `User`.
- Utworzono i zastosowano migrację `init_user` dla tabeli `users`.
- Dodano `PrismaModule` i `PrismaService`.
- Zmieniono port hosta PostgreSQL na `5433`, żeby uniknąć konfliktu z istniejącą lokalną bazą na `5432`.
- Dodano devlog `devlog/02_prisma-user-foundation.md`.
- Zweryfikowano `backend`: `npm run prisma:validate`, `npm run build`, `npm test`, `npm run test:e2e` przechodzą.

## 2026-06-27 — reset auth/users

- Usunięto eksperymentalną implementację `backend/src/auth/` i `backend/src/users/`.
- Uproszczono `backend/src/app.module.ts` do czystego szkieletu NestJS.
- Usunięto tymczasowe zależności Passport/JWT/Google OAuth z `backend/package.json`.
- Potwierdzono decyzję: users/auth odbudowujemy od zera na PostgreSQL + Prisma.
- Zweryfikowano `backend`: `npm install`, `npm run format`, `npm run build`, `npm test` i `npm run test:e2e` przechodzą.

## 2026-06-22

- Dodano standard workflow AI: `AGENTS.md`, `plan.md`, `project_state.md`.
- Dodano `docs/architecture.md` i `docs/decisions.md`.
- Uporządkowano `README.md` jako krótki entrypoint zamiast miejsca na cały plan.
- Ustalono, że devlog zostaje w głównym repo jako `devlog/`.
- Osobny pusty projekt `sharemeet-devlog` zarchiwizowano poza aktywnym workspace: `<local-archive>/sharemeet-devlog_20260622_232457`.
- Dodano `.gitignore` i `.prettierrc`.
- Zainicjalizowano lokalne repo git dla `sharemeet/`.
- Zweryfikowano, że backend obecnie nie buduje się przez błędy auth/users i brakujące/rozjechane zależności.

## 2026-06-14

- Udokumentowano decyzję PostgreSQL + MongoDB w `devlog/01_db-choice.md`.
