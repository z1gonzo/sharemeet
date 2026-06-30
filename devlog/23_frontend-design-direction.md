# 23: Frontend design direction — Focus Dark social-tech

Data: 2026-06-30

## Kontekst

Po domknięciu backendowego Core Social MVP przygotowano 3 throwaway mockupy HTML:

```text
sketches/001-sharemeet-clean
sketches/002-sharemeet-focus-dark
sketches/003-sharemeet-local-community
```

Początkowa rekomendacja szła w kierunku Clean + lekkie Local Community, bo to najbezpieczniejszy wariant dla klasycznego social MVP.

Po doprecyzowaniu celu projektu — portfolio/rekrutacja — wybrano jednak kierunek bardziej elegancki i techniczny.

## Decyzja

Bazą wizualną dla przyszłego produkcyjnego frontendu jest:

```text
sketches/002-sharemeet-focus-dark/index.html
```

Kierunek:

```text
Focus Dark jako baza
+ czytelność z Clean
+ subtelne community akcenty z Local Community
```

Krótka nazwa kierunku:

```text
premium dark social-tech UI
```

## Uzasadnienie

- Projekt ma dobrze wyglądać przed rekruterami.
- Focus Dark komunikuje większą dojrzałość niż generyczny jasny CRUD/social UI.
- Ciemny, precyzyjny layout dobrze pokazuje backendowe funkcje: `visibility`, `commentsCount`, `isFollowing`, feedy i profile.
- Nadal trzeba pilnować, żeby produkt pozostał social portalem, a nie technicznym dashboardem.

## Zapisane artefakty

- `docs/frontend-design.md` — główne wytyczne design direction.
- `docs/decisions.md` — ADR dla wyboru kierunku wizualnego.
- `sketches/README.md` — oznaczenie wybranego wariantu.
- `sketches/index.html` — strona porównawcza mockupów.

## Następny krok

Zacząć podstawowy frontend od dark shell/layout:

1. app shell,
2. login/register screens,
3. global feed na mockowanych danych,
4. profile card z `followersCount`, `followingCount`, `isFollowing`,
5. post card z `visibility` i `commentsCount`,
6. comments preview.

Dopiero potem podłączać realne API krok po kroku.
