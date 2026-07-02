# ShareMeet

ShareMeet is an educational social-platform project built step by step. The goal is to learn professional full-stack development by documenting not only the code, but also why each technical decision was made.

## Current goal

Build a stable MVP foundation before adding social features:

1. working NestJS backend,
2. clear auth/users storage decision,
3. email/password JWT auth,
4. documented database architecture,
5. later: frontend, profiles, posts, relationships, media and realtime features.

## Stack

Current/planned stack:

- Backend: NestJS + TypeScript
- Auth: JWT first; Google OAuth later or behind a clear milestone decision
- Databases: PostgreSQL + MongoDB in Docker Compose
- Frontend: Vite + React + TypeScript; Focus Dark shell with connected auth/global feed/following feed/composer/My posts/comments/profile/follow/profile posts preview/owner edit-delete (`docs/frontend-design.md`)
- Workflow: Hermes for planning/review/state; VSCode/Cline/Codex for implementation

## Repository structure

```text
.
├── AGENTS.md
├── README.md
├── plan.md
├── project_state.md
├── changelog.md
├── docs/
│   ├── architecture.md
│   ├── decisions.md
│   └── frontend-design.md
├── devlog/
│   └── 01_db-choice.md
├── sketches/
├── backend/
├── frontend/
└── db/
```

## Documentation map

- `project_state.md` — current verified state and blockers
- `plan.md` — next steps and phased roadmap
- `AGENTS.md` — rules for Hermes/Cline/Codex/other coding agents
- `docs/architecture.md` — architecture and module boundaries
- `docs/decisions.md` — ADR-style technical decisions
- `docs/frontend-design.md` — selected frontend visual direction
- `sketches/` — throwaway HTML mockups used to choose the frontend direction
- `devlog/` — learning journal and explanations of why decisions were made
- `changelog.md` — concise session summaries

## Local setup

### Databases

```bash
cd db
docker compose up -d
```

### Backend

```bash
cd backend
npm install
npm run build
npm run start:dev
```

### Demo seed data

After starting the databases, create/update deterministic local demo data:

```bash
cd backend
npm run seed:demo
```

Demo accounts use the password `DemoPass123!`:

| Username | Email |
|---|---|
| `z1gonzo` | `z1gonzo@sharemeet.local` |
| `maria` | `maria@sharemeet.local` |
| `adam` | `adam@sharemeet.local` |
| `kasia` | `kasia@sharemeet.local` |

### Smoke-test data cleanup

Preview old random smoke-test records without deleting anything:

```bash
cd backend
npm run cleanup:smoke
```

Apply cleanup only after reviewing the dry-run output:

```bash
npm run cleanup:smoke:apply
```

The cleanup script protects deterministic demo users (`z1gonzo`, `maria`, `adam`, `kasia`) and only targets known local smoke-test patterns.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Current state: backend is build-green with Prisma 6, PostgreSQL on local port `5433`, email/password JWT auth, DTO validation, protected `GET /auth/me`, profile endpoints with follow counts and `isFollowing`, text posts CRUD/global feed/following feed/my-posts/user-posts endpoints with `PUBLIC`/`FOLLOWERS`/`PRIVATE` visibility and `commentsCount`, comments on public posts, follow relationships (`POST/DELETE /users/:username/follow`, followers/following lists), deterministic demo seed data (`npm run seed:demo`), and dry-run-first smoke-test cleanup (`npm run cleanup:smoke`). Frontend has Focus Dark shell with connected auth (`register`, `login`, JWT local storage, `GET /auth/me`, logout), global feed (`GET /posts`), following feed (`GET /posts/following`), composer (`POST /posts`), My posts (`GET /posts/me`), comments list/create/edit/delete, profile/follow, profile posts preview, and owner edit/delete for posts. Avatar/profile reporting is documented as future backlog. Backend tests pass; frontend `npm run build` passes. See `project_state.md`.

## AI-assisted workflow

Before coding, read in this order:

1. `AGENTS.md`
2. `project_state.md`
3. `plan.md`
4. `docs/architecture.md`
5. `docs/decisions.md`

Rule: do not assume project state from chat memory. The repository Markdown files are the source of truth.
