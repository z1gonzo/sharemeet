# ShareMeet deployment checklist

This document prepares ShareMeet for a first public MVP/demo deployment. It is a planning/checklist document, not a record of a completed deployment.

## Recommended first deployment path

For the first portfolio-friendly public demo, prefer a managed/free-ish split deployment:

| Layer | Recommended option | Why |
| --- | --- | --- |
| Frontend | Vercel | Simple Vite deploys, preview URLs, good DX |
| Backend | Render Web Service | Simple Node service deploys, env UI, logs |
| PostgreSQL | Neon or Supabase Postgres | Free tier, managed Postgres, external connection string |

Alternative later:

- Frontend: Cloudflare Pages
- Backend: Fly.io or VPS
- DB: Neon/Supabase/Railway/Render Postgres
- Media later: Cloudflare R2 / Supabase Storage / S3-compatible bucket

## Current deploy-readiness changes

Backend now supports:

- `PORT` from the hosting provider.
- CORS from `FRONTEND_URL` and optional comma-separated `CORS_ORIGINS`.
- Production start script:

```bash
npm run start:prod
```

- Production migration script:

```bash
npm run prisma:migrate:deploy
```

Frontend now supports:

- `VITE_API_URL` for the public backend API URL.

## Required environment variables

### Backend

| Variable | Example value | Notes |
| --- | --- | --- |
| `DATABASE_URL` | managed Postgres URL | Neon/Supabase/Render/Railway connection string |
| `PORT` | provider-managed or `3000` | Render/Railway/Fly often inject this automatically |
| `JWT_SECRET` | long random secret | Required by auth module if not already configured |
| `JWT_ACCESS_EXPIRES_IN` | `900s` | Existing auth setting |
| `FRONTEND_URL` | public frontend origin | Used for CORS |
| `CORS_ORIGINS` | comma-separated extra origins | Optional preview/staging origins |

### Frontend

| Variable | Example value | Notes |
| --- | --- | --- |
| `VITE_API_URL` | public backend origin | Vite build-time API base URL |

## Backend deployment notes

Recommended Render-style settings:

```bash
Root directory: backend
Build command: npm ci && npm run build
Start command: npm run start:prod
```

After configuring `DATABASE_URL`, run migrations once per deployment/release:

```bash
npm run prisma:migrate:deploy
```

For the demo environment, seed deterministic demo data after migrations:

```bash
npm run seed:demo
```

Do not run `cleanup:smoke:apply` against a production-like environment unless you have reviewed the dry-run output for that environment.

## Frontend deployment notes

Recommended Vercel-style settings:

```bash
Root directory: frontend
Build command: npm ci && npm run build
Output directory: dist
```

Configure `VITE_API_URL` to the public backend origin before building.

## CORS flow

1. Deploy backend first.
2. Deploy frontend with `VITE_API_URL` pointing at backend.
3. Copy final frontend origin into backend `FRONTEND_URL`.
4. If using preview/staging URLs, add them to `CORS_ORIGINS` as comma-separated origins.
5. Redeploy/restart backend.
6. Browser smoke test login/feed/composer/comments/profile/follow.

## Demo smoke test after deploy

1. Open the public frontend URL.
2. Log in with demo credentials:
   - email: `z1gonzo@sharemeet.local`
   - password: `DemoPass123!`
3. Verify:
   - session hydrates through `GET /auth/me`,
   - global feed loads,
   - following feed loads after login,
   - My posts loads,
   - creating a temporary post works,
   - comments can be opened/created/edited/deleted,
   - Maria follow/unfollow works,
   - browser console has no CORS/API errors.

## Pre-public-demo checklist

- [ ] Choose hosting pair: Vercel + Render + Neon/Supabase.
- [ ] Create managed PostgreSQL database.
- [ ] Configure backend env vars.
- [ ] Deploy backend.
- [ ] Run `npm run prisma:migrate:deploy`.
- [ ] Run `npm run seed:demo` in demo environment.
- [ ] Configure frontend `VITE_API_URL`.
- [ ] Deploy frontend.
- [ ] Set backend CORS origins to final frontend URL.
- [ ] Browser smoke test auth/feed/composer/comments/profile/follow.
- [ ] Add public demo link to README when stable.

## Known limitations before public demo

- The frontend is a polished MVP shell, not a complete social product.
- Demo accounts share one documented password; acceptable for a portfolio demo, not production.
- No media uploads yet.
- No realtime messaging yet.
- Token storage is `localStorage`; acceptable for MVP/demo, not the final production security posture.
