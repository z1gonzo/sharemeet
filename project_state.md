# Stan projektu ShareMeet

> Single source of truth. Hermes/Cline/Codex nie zakładają stanu z pamięci rozmowy — najpierw czytają ten plik, `plan.md`, `AGENTS.md` i `README.md`.

## Status

- Etap: Milestone 1 — Auth Foundation
- Ostatnia sesja: 2026-06-22
- Repo: lokalny git zainicjalizowany w głównym projekcie `sharemeet/`
- Główne ryzyko: backend ma rozjazd między deklarowanymi zależnościami, kodem auth/users i wyborem bazy danych
- Następny krok: podjąć decyzję PostgreSQL/Prisma vs Mongo/Mongoose dla modułu users/auth, potem naprawić build backendu

## Organizacja projektu

- Główny projekt to `sharemeet/`.
- Proces nauki i uzasadnienia decyzji zostają w repo w katalogu `devlog/`.
- Osobny pusty projekt `sharemeet-devlog` został usunięty z aktywnego workspace przez archiwizację: `<local-archive>/sharemeet-devlog_20260622_232457`.
- Jeśli devlog kiedyś ma stać się publicznym blogiem/kursem, można go wydzielić później świadomie.

## Co działa

- Istnieje struktura projektu `backend/`, `db/`, `devlog/`, `docs/`.
- `db/docker-compose.yml` definiuje PostgreSQL 16 i MongoDB 7.
- Backend jest projektem NestJS z modułami `AuthModule` i `UsersModule`.
- Istnieje devlog opisujący plan PostgreSQL + MongoDB: `devlog/01_db-choice.md`.
- Repo ma standardowe pliki workflow dla pracy Hermes ↔ VSCode/Cline/Codex.

## Co nie działa / wymaga naprawy

Zweryfikowane przez `npm run build` w `backend/` na 2026-06-22:

- Build backendu nie przechodzi.
- Kod importuje zależności, które nie są spójnie dostępne/zadeklarowane w aktualnym projekcie: `@nestjs/passport`, `@nestjs/jwt`, `@nestjs/config`, `@nestjs/mongoose`, `mongoose`, `bcrypt`, `passport-google-oauth20`.
- Auth controller używa metod niedostępnych w aktualnych klasach: `authorize`, `validate`, `createGoogleUser`, `generateTokens`.
- Istnieją dwa pliki guardów JWT: `src/auth/jwt-auth.guard.ts` i `src/auth/guards/jwt-auth.guard.ts` — trzeba ujednolicić.
- Jest sprzeczność projektowa: devlog planuje zapis users/auth do PostgreSQL, a aktualny `users.schema.ts` używa Mongoose/MongoDB.

## Ostatnio wykonane

Data: 2026-06-22

- Uporządkowano dokumentację projektu pod workflow AI.
- Zdecydowano, że `devlog/` pozostaje wewnątrz głównego repo.
- Osobny pusty folder/projekt `sharemeet-devlog` zarchiwizowano poza aktywnym workspace.
- Dodano `.gitignore` i `.prettierrc`.
- Zainicjalizowano lokalne repo git i przygotowano pierwszy commit.
- Ponownie zweryfikowano realny stan backendu przez `npm run build`; blocker nadal aktualny.

## Następne zadania

- [ ] Wybrać docelowy storage dla users/auth: PostgreSQL + Prisma czy MongoDB + Mongoose.
- [ ] Zaktualizować `docs/decisions.md` decyzją o users/auth.
- [ ] Uporządkować zależności w `backend/package.json`.
- [ ] Naprawić `AuthModule`, `AuthController`, `AuthService`, `UsersModule`, `UsersService` tak, żeby build przechodził.
- [ ] Usunąć lub scalić zdublowany JWT guard.
- [ ] Dodać minimalny smoke test auth/users.

## Decyzje techniczne

| Data | Decyzja | Powód |
|---|---|---|
| 2026-06-14 | PostgreSQL + MongoDB jako architektura docelowa | PostgreSQL dla relacji, MongoDB dla logów/media/notyfikacji |
| 2026-06-22 | Wprowadzamy `plan.md` + `project_state.md` + `AGENTS.md` | Jeden wspólny stan dla Hermesa, VSCode/Cline/Codex i człowieka |
| 2026-06-22 | Devlog zostaje w głównym repo jako `devlog/` | Proces nauki powinien być widoczny obok kodu i decyzji |

## Otwarte pytania

- Czy users/auth w MVP mają iść przez PostgreSQL + Prisma, zgodnie z wcześniejszym planem?
- Czy obecne pliki Mongoose są eksperymentem do usunięcia, czy zmieniamy plan na Mongo dla users?
- Czy Google OAuth robimy w Milestone 1, czy najpierw prosty email/password + JWT?
- Czy tworzymy remote repo na GitHubie teraz, czy dopiero po pierwszej sesji naprawy backendu?

## Instrukcja dla agenta

1. Nie zakładaj stanu projektu z pamięci rozmowy.
2. Przed planowaniem/kodowaniem sprawdź `AGENTS.md`, `project_state.md`, `plan.md` i `README.md`.
3. Po zmianach zaproponuj aktualizację tego pliku.
4. Jeśli odkryjesz rozjazd między kodem a dokumentacją, oznacz go jako blocker.
