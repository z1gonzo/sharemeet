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
- Frontend: TODO
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
│   └── decisions.md
├── devlog/
│   └── 01_db-choice.md
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

> Current state: backend is a clean NestJS skeleton after resetting the experimental auth/users code. `npm run build`, `npm test` and `npm run test:e2e` pass. Next step: rebuild users/auth on PostgreSQL + Prisma. See `project_state.md`.

## AI-assisted workflow

Before coding, read in this order:

1. `AGENTS.md`
2. `project_state.md`
3. `plan.md`
4. `docs/architecture.md`
5. `docs/decisions.md`

Rule: do not assume project state from chat memory. The repository Markdown files are the source of truth.
