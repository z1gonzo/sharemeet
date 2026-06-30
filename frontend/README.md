# ShareMeet Frontend

First production frontend slice for ShareMeet.

## Stack

- Vite
- React
- TypeScript
- CSS modules by convention later; current first slice uses `src/styles.css`

## Current scope

This is a mixed frontend slice: auth and global feed are connected to the backend, while composer/profile/follow/comments are still mocked/local.

Implemented:

- Focus Dark social-tech app shell,
- left navigation/sidebar,
- main feed layout connected to `GET /posts`,
- mocked composer with visibility pills,
- post cards with real `visibility` and `commentsCount` from the global feed,
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

1. connect `POST /posts` from the composer,
2. connect public profile/follow state,
3. connect comments.
