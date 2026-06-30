# ShareMeet Frontend

First production frontend slice for ShareMeet.

## Stack

- Vite
- React
- TypeScript
- CSS modules by convention later; current first slice uses `src/styles.css`

## Current scope

This is still a mocked UI slice — no backend API integration yet.

Implemented:

- Focus Dark social-tech app shell,
- left navigation/sidebar,
- main feed layout,
- mocked composer with visibility pills,
- mocked post cards with `visibility` and `commentsCount`,
- comments preview panel,
- right profile/context panel with `followersCount`, `followingCount`, `isFollowing`,
- mocked login/register screens for existing auth endpoints,
- mock submit status for `POST /auth/login` and `POST /auth/register`,
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

## Next step

Keep the UI mocked for one more small slice if needed, then connect API gradually:

1. connect `POST /auth/login` and `POST /auth/register`,
2. persist the JWT access token,
3. connect `GET /auth/me`,
4. connect global feed,
5. connect public profile/follow/comments.
