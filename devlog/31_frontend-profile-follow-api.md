# 31: Frontend profile/follow API integration

Data: 2026-07-01

## Zmiana

Podłączono prawy panel profilu do backendowych endpointów profilu i follow/unfollow:

```text
GET /users/:username
POST /users/:username/follow
DELETE /users/:username/follow
```

## Zakres

Dodano:

- typ `ApiPublicProfile` w `frontend/src/api.ts`,
- `getUserProfile(username, accessToken?)`,
- `followUser(username, accessToken)`,
- `unfollowUser(username, accessToken)`,
- obsługę `204 No Content` w `apiRequest`,
- realne pobieranie profilu `maria` do prawego panelu,
- odświeżanie profilu po zmianie JWT / login/logout,
- loading/error state dla profilu,
- przycisk `Follow` / `Following` wywołujący `POST` / `DELETE`,
- auth guard: bez JWT kliknięcie Follow otwiera login i pokazuje komunikat.

## Rola coding workera

Zadanie zostało zlecone profilowi Hermes `coding` z modelem `moonshotai/kimi-k2.6` przez NVIDIA. Kimi dostał około 10 minut pracy. Przygotował większość zmian w `api.ts` i `App.tsx`, ale zostawił brakujące helpery `profileInitials` i `FollowButton`; supervisor GPT-5.5 dokończył build-fix, smoke test i dokumentację.

## Smoke test

Zweryfikowano realnie:

1. PostgreSQL/Mongo z Docker Compose działały lokalnie.
2. Backend działał na `127.0.0.1:3000`.
3. Frontend działał na `127.0.0.1:5173`.
4. Upewniono się, że użytkownik `maria` istnieje w DB.
5. Utworzono testowego followera.
6. `GET /users/maria` zwrócił `followersCount` i `followingCount`.
7. `POST /users/maria/follow` zwrócił `201`, a `GET /users/maria` z tokenem zwrócił `isFollowing: true`.
8. `DELETE /users/maria/follow` zwrócił `204`, a `GET /users/maria` z tokenem zwrócił `isFollowing: false`.
9. UI po zalogowaniu testowego followera pokazało profil Marii, klik `Follow` zmienił button na `Following`, a API potwierdziło `isFollowing: true`.
10. Klik `Following` wykonał unfollow, API potwierdziło `isFollowing: false`.
11. Konsola przeglądarki bez JS errors.

## Weryfikacja

```bash
cd frontend && npm run build
cd backend && npm run build
```

Oba buildy przeszły.

## Następny krok

Core frontend integration dla Fazy 2 jest domknięte w minimalnym zakresie. Następne sensowne małe kroki:

- polish UX panelu profilu/komentarzy,
- public profile posts w widoku profilu,
- edit/delete komentarzy/postów dla właściciela,
- cleanup mocków i przygotowanie demo seed data.
