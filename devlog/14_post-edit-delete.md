# 14: Edycja i usuwanie własnych postów — `PATCH /posts/:id`, `DELETE /posts/:id`

Data: 2026-06-29

## Kontekst

Po dodaniu tworzenia postów, pojedynczego odczytu, globalnego feedu i paginowanej listy postów użytkownika brakowało podstawowej możliwości zarządzania własną treścią.

Najmniejszy sensowny następny krok to:

```http
PATCH /posts/:id
DELETE /posts/:id
```

z jasną regułą własności: tylko autor posta może go edytować albo usunąć.

## Co zrobiono

- Dodano `UpdatePostDto` z walidacją `content` 1–1000 znaków.
- Dodano `PostsService.updateOwnPost(id, authorId, data)`.
- Dodano `PostsService.deleteOwnPost(id, authorId)`.
- Dodano kontrolę własności posta:
  - brak posta → `404 Post not found`,
  - inny autor → `403 You can only modify your own posts`.
- Dodano chronione endpointy:
  - `PATCH /posts/:id`,
  - `DELETE /posts/:id`.
- `DELETE /posts/:id` zwraca `204 No Content`.
- Dodano testy jednostkowe i e2e.

## Zakres API

### `PATCH /posts/:id`

Wymaga JWT access tokena.

Request:

```json
{
  "content": "Edited ShareMeet post"
}
```

Responses:

| Status | Znaczenie |
|---|---|
| `200` | Post zaktualizowany |
| `400` | Niepoprawny payload |
| `401` | Brak tokena albo token niepoprawny |
| `403` | Próba edycji cudzego posta |
| `404` | Post nie istnieje |

### `DELETE /posts/:id`

Wymaga JWT access tokena.

Responses:

| Status | Znaczenie |
|---|---|
| `204` | Post usunięty |
| `401` | Brak tokena albo token niepoprawny |
| `403` | Próba usunięcia cudzego posta |
| `404` | Post nie istnieje |

## Czego celowo nie dodano

- soft delete,
- historii edycji,
- moderacji treści posta,
- rate limitów,
- uprawnień admina/moderatora,
- reguł prywatności/followers-only.

To zostaje na późniejsze etapy.

## Co zweryfikowano punktowo

```bash
npm test -- posts.service.spec.ts
npm run test:e2e -- posts.e2e-spec.ts
```

Wynik:

- `PostsService`: 8 testów przechodzi,
- `PostsController e2e`: 17 testów przechodzi.

Pełna weryfikacja:

```bash
npm run lint
npm run prisma:validate
npm run build
npm test
npm run test:e2e
```

Wynik:

- lint: przechodzi,
- Prisma schema valid,
- build: przechodzi,
- unit: 4 test suites, 21 testów,
- e2e: 4 test suites, 37 testów.

## Następny krok

Po tej zmianie backend ma podstawowe CRUD dla postów tekstowych. Najbardziej naturalne kolejne kroki:

1. zacząć relacje/follows,
2. albo dodać comments jako kolejny element social MVP,
3. albo dopracować post visibility/privacy przed relacjami.

Rekomendacja: zacząć od relacji/follows, bo później globalny feed można rozwinąć w feed obserwowanych.
