# ShareMeet Frontend

First production frontend slice for ShareMeet.

## Stack

- Vite
- React
- TypeScript
- CSS modules by convention later; current first slice uses `src/styles.css`

## Current scope

This is a mixed frontend slice: auth, global feed, following feed, post composer, My posts, and comments are connected to the backend, while profile/follow are still mocked/local.

Implemented:

- Focus Dark social-tech app shell,
- left navigation/sidebar,
- main feed layout connected to `GET /posts`,
- Following tab connected to `GET /posts/following`,
- connected composer with visibility pills and `POST /posts`,
- My posts tab connected to `GET /posts/me`,
- post cards with real `visibility` and `commentsCount` from the global feed,
- comments panel connected to `GET /posts/:postId/comments` and `POST /posts/:postId/comments`,
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

1. connect public profile/follow state,
2. polish comments UX and add edit/delete later.
