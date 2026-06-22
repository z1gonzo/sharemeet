# 01: Dlaczego PostgreSQL + MongoDB? 🤔📊

## Kontekst projektu

W projekcie **ShareMeet** planujemy użyć dwóch baz danych, ale nie dla tych samych odpowiedzialności:

- **PostgreSQL** → dane relacyjne: `users`, `friends`, `posts`, `comments`
- **MongoDB** → elastyczne dokumenty: `media_uploads`, `activity_logs`, `notifications`

## Dlaczego tak?

### ✅ PostgreSQL — relacje i spójność

- Idealny do danych, które mają jasne relacje: użytkownicy ↔ przyjaciele ↔ posty.
- Obsługuje transakcje (`INSERT`, `UPDATE`, `DELETE`) bez ryzyka pomyłek.
- Klucze obce dbają o spójność danych.
- JOIN-y ułatwią budowanie feedu, profilu, relacji i komentarzy.

### ✅ MongoDB — dokumenty i elastyczność

- Dobre miejsce na dane mniej relacyjne albo zmienne w strukturze.
- Pasuje do logów aktywności, notyfikacji i metadanych uploadów.
- Można dodać później, gdy podstawowy model relacyjny już działa.

## Plan integracji

1. **Auth/users**: JWT + opcjonalnie Google OAuth → PostgreSQL.
2. **Relacje**: `friends`, `posts`, `comments` → PostgreSQL.
3. **Media & logi**: MongoDB — późniejsza faza.
4. **Devlog**: dokumentujemy każdy istotny krok nauki w `devlog/` wewnątrz głównego repo.

## Aktualny blocker

Aktualny kod backendu częściowo używa Mongoose dla users/auth, co jest sprzeczne z powyższym planem. Przed dalszym kodowaniem trzeba potwierdzić decyzję storage w `docs/decisions.md` i dostosować kod.

## Co dalej?

- [ ] Potwierdzić decyzję: PostgreSQL/Prisma dla users/auth czy Mongo/Mongoose.
- [ ] Jeśli PostgreSQL/Prisma: usunąć Mongoose z users/auth i dodać Prisma.
- [ ] Jeśli Mongo/Mongoose: zaktualizować ten devlog, architekturę i decyzje.
- [ ] Doprowadzić `backend/npm run build` do zielonego stanu.

---

*Zapisano: 2026-06-14, zaktualizowano: 2026-06-22.*
