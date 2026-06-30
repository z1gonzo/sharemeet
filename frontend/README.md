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

1. auth login/register,
2. global feed,
3. public profile,
4. follow/unfollow,
5. comments.
