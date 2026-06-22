# ShareMeet Backend

NestJS backend for the ShareMeet educational social-platform project.

## Current status

The backend exists, but it is not yet build-green. The current blocker is the auth/users foundation:

- auth code imports JWT/Passport/Config/Mongoose-related packages inconsistently,
- users/auth storage decision is not finalized,
- controller/service method contracts do not match,
- duplicate JWT guards exist.

Before adding new features, read:

- `../project_state.md`
- `../plan.md`
- `../docs/architecture.md`
- `../docs/decisions.md`

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

Expected current result: fails until the auth/users blocker is fixed. Do not treat the backend as working until this command passes.

## Development server

```bash
npm run start:dev
```

Run this only after the build blocker is resolved or while actively debugging it.

## Tests

```bash
npm test
npm run test:e2e
```

Tests should be added/updated as part of the auth foundation work.

## Next coding task

Recommended first VSCode/Cline task:

1. Confirm storage decision for users/auth in `../docs/decisions.md`.
2. Align `package.json` dependencies with that decision.
3. Simplify auth to email/password + JWT first.
4. Disable or defer Google OAuth until basic JWT works.
5. Make `npm run build` pass.
