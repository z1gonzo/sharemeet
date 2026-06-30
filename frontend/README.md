# ShareMeet Frontend

First production frontend slice for ShareMeet.

## Stack

- Vite
- React
- TypeScript
- CSS modules by convention later; current first slice uses `src/styles.css`

## Current scope

This is a mixed first frontend slice: auth is connected to the backend, while feed/profile/follow/comments are still mocked.

Implemented:

- Focus Dark social-tech app shell,
- left navigation/sidebar,
- main feed layout,
- mocked composer with visibility pills,
- mocked post cards with `visibility` and `commentsCount`,
- comments preview panel,
- right profile/context panel with `followersCount`, `followingCount`, `isFollowing`,
- connected login/register screens for existing auth endpoints,
- JWT access token persisted in `localStorage` as `sharemeet.accessToken`,
- session hydration through `GET /auth/me`,
- logout that clears the local token,
- responsive single-column fallback.

Design source of truth:

```text
../docs/frontend-design.md
```

## Commands

```bash
npm install
npm run dev
npm run build
```

By default the frontend calls:

```text
http://localhost:3000
```

Override it with:

```bash
VITE_API_URL=http://localhost:3000 npm run dev
```

## Next step

Connect API gradually:

1. connect global feed `GET /posts`,
2. connect `POST /posts`,
3. connect public profile/follow state,
4. connect comments.
