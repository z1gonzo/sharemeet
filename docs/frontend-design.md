# ShareMeet Frontend Design Direction

Data: 2026-06-30

## Decyzja

ShareMeet idzie w kierunku:

> **premium dark social-tech UI** — elegancki, ciemny interfejs inspirowany Linear/Vercel, ale z czytelnymi wzorcami social feedu i subtelnymi, cieplejszymi community akcentami.

Bazą wizualną jest mockup:

```text
sketches/002-sharemeet-focus-dark/index.html
```

Nie robimy typowego „byle jakiego CRUD UI”. Projekt ma wyglądać dobrze jako portfolio/rekrutacyjny showcase: backend jest przemyślany, a frontend powinien umieć to pokazać.

## Dlaczego ten kierunek

- Projekt ma być atrakcyjny dla rekruterów i pokazywać jakość wykonania.
- Focus Dark wygląda bardziej profesjonalnie niż klasyczny jasny MVP social feed.
- Ciemny styl lepiej eksponuje techniczne elementy backendu: visibility, counts, JWT, profile state.
- Wariant ma być nadal społecznościowy, nie dashboardowy — użytkownik ma czuć feed, profil i relacje, nie panel administracyjny.

## Charakter produktu

ShareMeet ma wyglądać jak:

- nowoczesny social-tech produkt,
- elegancki portfolio project,
- aplikacja z precyzyjnym backendem i dopracowanym UI,
- ciemny, spokojny feed społecznościowy.

ShareMeet nie ma wyglądać jak:

- generyczny CRUD z tutoriala,
- przesadzony dashboard SaaS,
- ciężka aplikacja enterprise,
- kolorowy marketplace/event portal.

## Źródła inspiracji

### Główne

- Linear — dark-first, precyzyjne panele, subtelne borders, indigo accent.
- Vercel — techniczna elegancja, prostota, wysoki kontrast.

### Uzupełniające

- Clean mockup — czytelność feedu i prostota social MVP.
- Local Community mockup — cieplejsze, ludzkie mikroakcenty.

## Kolory

### Tło i powierzchnie

| Rola | Kolor | Użycie |
|---|---:|---|
| App background | `#08090a` | główne tło aplikacji |
| Sidebar / shell | `#0f1011` | lewa nawigacja, głębsze panele |
| Panel background | `#191a1b` | karty, modale, większe panele |
| Elevated subtle | `rgba(255,255,255,0.03)` | card fill, composer, row hover |
| Border subtle | `rgba(255,255,255,0.08)` | karty, inputy, separatory |

### Tekst

| Rola | Kolor | Użycie |
|---|---:|---|
| Primary text | `#f7f8f8` | nagłówki, główny tekst |
| Secondary text | `#d0d6e0` | body, treść postów |
| Muted text | `#8a8f98` | metadata, opisy |
| Subtle text | `#62666d` | timestampy, techniczne etykiety |

### Akcenty

| Rola | Kolor | Użycie |
|---|---:|---|
| Primary accent | `#5e6ad2` | główne CTA, aktywne stany |
| Accent hover | `#7170ff` | hover, selected state |
| Success/community | `#10b981` | Following, pozytywne statusy |
| Warm micro-accent | `#ffb86b` | sporadyczne community highlights, nie jako główny kolor |

## Typography

- Primary font: `Inter`.
- Optional mono font: `JetBrains Mono` dla małych etykiet technicznych.
- Display/headings: `Inter`, weight `510–600`, tight letter spacing.
- Body: `Inter`, weight `400`, kolor `#d0d6e0`.
- Metadata: `13px`, muted, często z małą ikoną/status pill.

Preferencja:

```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
font-feature-settings: "cv01", "ss03";
```

## Layout

### Desktop

Preferowany układ:

```text
left nav/sidebar | main feed | right profile/context panel
```

- Sidebar: nawigacja, aktualny użytkownik, szybkie filtry.
- Main feed: composer, tabs, post cards.
- Right panel: profil, follow state, backend contract preview, suggestions.

### Mobile

- Single column.
- Sidebar i right panel chowają się do top nav / drawer.
- Feed pozostaje pierwszym ekranem.
- Composer może być zwinięty do przycisku „New post”.

## Komponenty bazowe

### Post card

Musi pokazywać:

- autora,
- username,
- czas,
- `visibility`,
- `commentsCount`,
- akcje komentarzy,
- opcjonalny preview komentarzy.

Post card nie powinien być przeładowany. Najważniejsza jest czytelność treści posta.

### Profile card

Musi pokazywać:

- avatar/display name/username,
- bio,
- `followersCount`,
- `followingCount`,
- `isFollowing`,
- Follow/Following button.

### Composer

- Prosty textarea.
- Widoczny wybór `visibility`: `PUBLIC`, `FOLLOWERS`, `PRIVATE`.
- Primary action: `Publish`.

### Buttons

- Primary: indigo background, jasny tekst.
- Secondary: transparent/ghost z subtle border.
- Following: emerald/success albo filled neutral state.

### Pills / badges

Używać dla:

- `PUBLIC`, `FOLLOWERS`, `PRIVATE`,
- statusów profilu,
- backend feature callouts.

## Backend features, które frontend powinien eksponować

Frontend ma jasno pokazywać, że backend nie jest płaskim CRUD-em:

- auth: register/login/me,
- profile: counts + `isFollowing`,
- follows: follow/unfollow,
- posts: CRUD + visibility,
- feeds: global/following/my-posts,
- comments,
- `commentsCount`.

To są elementy portfolio — UI powinien je subtelnie, ale widocznie komunikować.

## Do's

- Utrzymuj dark-first UI jako domyślny kierunek.
- Używaj subtelnych ramek i luminance stacking zamiast ciężkich cieni.
- Pokazuj realne dane społecznościowe, nie lorem ipsum.
- Zachowuj czytelny feed — nie zamieniaj ShareMeet w panel admina.
- Buduj frontend małymi pionowymi slice'ami.
- Najpierw auth + feed + profile + comments preview, potem dopiero polish.

## Don'ts

- Nie rób jasnego, generycznego CRUD UI jako głównego kierunku.
- Nie przesadzaj z animacjami i gradientami.
- Nie kopiuj Linear 1:1 — ShareMeet ma być social-tech, nie issue tracker.
- Nie ukrywaj social funkcji za zbyt technicznym dashboardem.
- Nie dodawaj pełnego design systemu zanim powstanie pierwszy działający frontend.

## Pierwszy frontend slice

Rekomendowany pierwszy produkcyjny slice:

1. Utworzyć frontend app.
2. Zrobić dark shell/layout.
3. Dodać mockowane ekrany:
   - login/register,
   - global feed,
   - profile panel,
   - post card,
   - comments preview.
4. Dopiero potem podłączyć realne API krok po kroku.

## Status mockupów

| Mockup | Status |
|---|---|
| `001-sharemeet-clean` | referencja czytelności |
| `002-sharemeet-focus-dark` | **wybrana baza wizualna** |
| `003-sharemeet-local-community` | referencja dla subtelnych community akcentów |
