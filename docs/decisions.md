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
