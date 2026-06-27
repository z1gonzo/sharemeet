# 02: Dlaczego Prisma dla users/auth?

Data: 2026-06-27

## Kontekst

Po resecie eksperymentalnego kodu auth/users wracamy do czystego szkieletu NestJS. Pierwszy świadomy krok to ustawienie fundamentu danych dla użytkowników.

W ShareMeet dane `users/auth` są relacyjne:

- użytkownik ma unikalny email i username,
- później pojawią się relacje znajomych/follow,
- posty i komentarze będą wskazywać autora,
- logowanie i uprawnienia wymagają spójności danych.

Dlatego dla `users/auth` używamy PostgreSQL, a nie MongoDB.

## Dlaczego Prisma?

Prisma jest jednym z najczęściej używanych ORM-ów / data access tooli w ekosystemie Node.js + TypeScript. Daje kilka rzeczy ważnych edukacyjnie i praktycznie:

- typowany klient TypeScript generowany ze schematu,
- czytelny model danych w `prisma/schema.prisma`,
- migracje bazy danych jako część historii projektu,
- łatwe przejście od prostego CRUD do relacji,
- dobre dopasowanie do NestJS i PostgreSQL,
- popularność w projektach full-stack, szczególnie z Next.js/NestJS.

To jest dobry wybór dla projektu portfolio, bo pokazuje profesjonalny, współczesny workflow pracy z bazą.

## Co zrobiono w tym kroku

- Dodano zależności `@prisma/client` i `prisma` w wersji 6.19.3.
- Dodano `backend/prisma/schema.prisma`.
- Dodano pierwszy model `User` mapowany na tabelę `users`.
- Utworzono i zastosowano migrację `init_user`.
- Dodano globalny `PrismaModule` i `PrismaService` dla NestJS.
- Podłączono `ConfigModule`, żeby backend czytał lokalne `.env`.
- Zmieniono lokalny port PostgreSQL na `5433`, bo `5432` był już zajęty przez inną bazę.

## Dlaczego model `User` wygląda tak?

Pierwszy model zawiera tylko pola potrzebne pod auth i późniejszy profil:

- `id` jako UUID,
- `email` unikalny,
- `username` unikalny,
- `passwordHash`, a nie `password`,
- opcjonalne pola profilu: `displayName`, `bio`, `avatarUrl`,
- `isPrivate` pod public/private profile,
- `isActive` pod późniejszą administrację/blokady,
- `createdAt` i `updatedAt` dla audytu.

Nie dodajemy jeszcze friends/posts/OAuth/refresh tokens, bo chcemy iść małymi krokami.

## Następny krok

- Dodać `UsersModule` z minimalnym publicznym interfejsem.
- Napisać pierwszy test zachowania dla utworzenia albo pobrania użytkownika.
- Potem dopiero `AuthModule`, register/login i JWT.
