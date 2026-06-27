# 04: Pierwszy AuthModule — rejestracja email/password

Data: 2026-06-27

## Kontekst

Po dodaniu `UsersService` mamy już warstwę zapisu/odczytu użytkowników. Następny mały krok to `AuthModule`, ale tylko w zakresie rejestracji. Nie dodajemy jeszcze loginu ani JWT, żeby nie wrzucać zbyt wielu odpowiedzialności naraz.

## Co zrobiono

- Dodano `AuthModule`.
- Dodano `AuthService.register`.
- Dodano `AuthController` z endpointem `POST /auth/register`.
- Dodano `RegisterDto`.
- Dodano `bcryptjs` do hashowania hasła.
- Podłączono `AuthModule` do `AppModule`.
- Dodano test jednostkowy `AuthService`.
- Dodano test e2e dla `POST /auth/register`.

## Dlaczego `bcryptjs`?

Na tym etapie zależy nam na prostym, przenośnym hashowaniu hasła bez walki z natywnymi zależnościami. `bcryptjs` jest implementacją bcrypt w JavaScript, więc dobrze działa w środowiskach developerskich i CI.

W przyszłości można rozważyć `argon2` albo natywny `bcrypt`, ale na start ważniejsze jest zbudowanie poprawnej granicy odpowiedzialności:

- `AuthService` hashuje hasło,
- `UsersService` zapisuje już gotowy `passwordHash`,
- API nigdy nie zwraca `passwordHash`.

## Co zweryfikowano

W `backend/` przechodzą:

```bash
npm run lint
npm run prisma:validate
npm run build
npm test
npm run test:e2e
```

Dodatkowo uruchomiono aplikację lokalnie na porcie `3001` i sprawdzono:

- `GET /` zwraca `Hello World!`,
- `POST /auth/register` tworzy użytkownika,
- odpowiedź API nie zawiera `passwordHash`,
- w PostgreSQL zapisany hash nie jest równy plain password.

Testowy użytkownik smoke został usunięty z bazy po weryfikacji.

## Następny krok

Dodać logowanie:

1. `AuthService.login`,
2. porównanie hasła z `passwordHash`,
3. `@nestjs/jwt`,
4. access token,
5. `POST /auth/login`,
6. testy jednostkowe i e2e.
