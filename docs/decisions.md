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

## Pending — storage dla users/auth

Status: proposed / do rozstrzygnięcia przed kodowaniem

### Pytanie

Czy w MVP users/auth idą przez PostgreSQL + Prisma, czy przez MongoDB + Mongoose?

### Rekomendacja robocza

Trzymać users/auth w PostgreSQL, zgodnie z pierwotnym devlogiem. MongoDB zostawić na media/logi/notyfikacje.

### Dlaczego

- Users, auth, relacje, posty i komentarze są relacyjne.
- PostgreSQL ułatwia spójność danych i późniejsze relacje/friends.
- Unikamy mieszania dwóch modeli danych w jednym module.

### Następny krok

Potwierdzić tę decyzję w sesji `grill-with-docs` lub podczas planowania w Hermesie, a potem naprawić kod backendu zgodnie z wybranym kierunkiem.
