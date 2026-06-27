# 03: Minimalny UsersService na Prisma

Data: 2026-06-27

## Kontekst

Po dodaniu Prisma i tabeli `users` potrzebowaliśmy pierwszej małej warstwy aplikacyjnej, która będzie korzystać z bazy. Nie zaczynamy jeszcze od JWT ani kontrolerów HTTP, bo najpierw warto mieć prosty, testowalny moduł użytkowników.

## Co zrobiono

- Dodano `UsersModule`.
- Dodano `UsersService` korzystający z `PrismaService`.
- Dodano `CreateUserDto` jako minimalny kontrakt wejściowy dla tworzenia użytkownika.
- Podłączono `UsersModule` do `AppModule`.
- Dodano testy dla publicznych metod `UsersService`:
  - `createUser`,
  - `findByEmail`,
  - `findById`.

## Dlaczego tak mało?

To jest celowe. `UsersService` nie hashuje jeszcze hasła i nie wystawia publicznych endpointów. Jego zadaniem jest tylko operacja na użytkowniku w bazie.

Hashowanie, walidacja register/login i JWT będą należały do `AuthModule`, który użyje `UsersService` jako zależności.

Dzięki temu granice odpowiedzialności są prostsze:

- `UsersService` — zapis/odczyt użytkowników,
- `AuthService` — register/login, hashowanie hasła, tokeny,
- `AuthController` — publiczne endpointy HTTP.

## Co zweryfikowano

W `backend/` przechodzą:

```bash
npm run lint
npm run prisma:validate
npm run build
npm test
npm run test:e2e
```

Aktualny wynik testów:

- unit: 2 test suites, 4 tests,
- e2e: 1 test suite, 1 test.

## Następny krok

Dodać `AuthModule` w małym zakresie:

1. dodać zależność do hashowania hasła,
2. dodać `AuthService.register`,
3. dodać `POST /auth/register`,
4. napisać test zachowania dla rejestracji.

JWT login zostawić jako kolejny krok po działającym register.
