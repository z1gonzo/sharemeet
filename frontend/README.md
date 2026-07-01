# ShareMeet Frontend

First production frontend slice for ShareMeet.

## Stack

- Vite
- React
- TypeScript
- CSS modules by convention later; current first slice uses `src/styles.css`

## Current scope

This frontend slice connects auth, global feed, following feed, post composer, My posts, comments, and the profile/follow panel to the backend.

Implemented:

- Focus Dark social-tech app shell,
- left navigation/sidebar,
- main feed layout connected to `GET /posts`,
- Following tab connected to `GET /posts/following`,
- connected composer with visibility pills and `POST /posts`,
- My posts tab connected to `GET /posts/me`,
- post cards with real `visibility` and `commentsCount` from the global feed,
- comments panel connected to `GET /posts/:postId/comments` and `POST /posts/:postId/comments`,
- right profile/context panel connected to `GET /users/:username` with `followersCount`, `followingCount`, `isFollowing`,
- follow/unfollow button connected to `POST /users/:username/follow` and `DELETE /users/:username/follow`,
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

1. polish comments/profile UX,
2. add profile posts and edit/delete actions later.
