# Project Management

Internal Jira-like project/issue tracker. Monorepo with a Node/Express API (`/backend`) and a React frontend (`/frontend`), backed by PostgreSQL.

This is **Phase 1**: auth, projects, issue tracking (Epic → Story/Task/Bug → Subtask), a Kanban board, and comments. Sprints/backlog, configurable workflows, and reporting dashboards are planned as later phases.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or reachable via `DATABASE_URL`)

## Backend setup

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL and a real JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev             # http://localhost:4000
```

## Frontend setup

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL if not using the default
npm install
npm run dev              # http://localhost:5173
```

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/users`
- `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id`
- `POST/DELETE /api/projects/:id/members[/:userId]`
- `GET /api/projects/:id/statuses`
- `GET/POST /api/projects/:id/issues`, `GET/PATCH/DELETE /api/issues/:id`
- `GET/POST /api/issues/:id/comments`, `DELETE /api/comments/:commentId`

All routes except register/login require a `Bearer` JWT.
