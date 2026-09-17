# Prompt Library

An internal prompt library for AlgoAnalytics. Everyone with an
`@algoanalytics.com` account can sign in and browse, search, and submit
prompts; admins get an approval workflow, a usage dashboard, and user
management. It ships pre-seeded with **387 prompts across 16 categories**
(Data Scientist, Managers, Marketing, UI/UX Developers, Full Stack
Developers, Mobile App Development, Github Commands, Azure, AWS, Docker,
QA Testing, Research Prompt, Finance, Presentation Skills, Content
Generation, General), each tagged with a complexity level and a
recommended AI tool/model to use it with.

## Features

- **Auth**: Google OAuth or email/password, both restricted server-side to
  the `@algoanalytics.com` domain (or whatever `ALLOWED_EMAIL_DOMAIN` is set
  to). Roles are `USER` and `ADMIN`.
- **Library**: search by keyword, filter by category and complexity,
  paginated (24/page). Clicking a prompt opens it in a modal (no page
  navigation) with `{{variable}}` placeholders highlighted, a copy button
  that tracks usage, and a favorite toggle.
- **Tool/model recommendation**: every prompt shows which AI tool (Claude,
  ChatGPT, or Gemini) tends to fit its category best, at a cost-appropriate
  model tier for its complexity (never defaulting to the priciest model),
  plus a free Groq alternative — computed heuristically, no extra API calls.
- **Submissions & approvals**: any user can submit a new prompt or propose
  an edit to an existing one; both go into a pending queue. Admins approve
  or reject from `/admin/submissions`, with an email notification to the
  submitter (if configured) and an audit-log entry either way.
- **Prompt Assistant** (`/library/assistant`): draft an idea, see if
  something similar already exists in the library, and optionally have
  Claude, ChatGPT, Gemini, or Groq rewrite it into a clearer prompt using
  your own API key.
- **Admin dashboard**: total prompts/users, pending-submission count,
  most-used prompts, top contributors, searches that returned nothing, plus
  user management (promote/demote, activate/deactivate) and an audit log of
  every admin action.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- NextAuth v5 (beta) — Google OAuth + Credentials
- Prisma 6 + PostgreSQL
- `@anthropic-ai/sdk`, `openai`, `@google/generative-ai` (Prompt Assistant's
  optimizer; Groq is called via its OpenAI-compatible REST endpoint, no SDK)
- `pino` (structured logging), `zod` (validation)
- Vitest (unit tests) + GitHub Actions CI

## Prerequisites

- Node.js 22+
- Docker (for local Postgres) — or point `DATABASE_URL` at any Postgres 16+
  instance you already have
- A Google Cloud OAuth client (only needed for Google sign-in; email/password
  works without it)

## First-time setup

1. Start Postgres:

   ```bash
   docker compose up -d
   ```

2. Copy `.env.example` to `.env` and fill in the required values (see the
   table below).

3. Install dependencies, run migrations, and seed the database:

   ```bash
   npm install
   npm run db:migrate
   npm run db:seed          # creates the first admin account + one sample prompt
   npm run db:seed-library   # loads the full 387-prompt library (idempotent)
   ```

   `db:seed` creates the first admin with password `ChangeMe123!` — change
   it after first login, or just sign in with Google using the same email
   (it will pick up the `ADMIN` role automatically since the email matches).

4. Start the dev server:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:3000` by default (or whatever port
   `next dev` picks / you override with `--port`).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string |
| `AUTH_SECRET` | Yes | NextAuth session signing secret — generate with `npx auth secret` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | For Google login | From a Google Cloud OAuth client (see below) |
| `ALLOWED_EMAIL_DOMAIN` | Yes | Domain allowed to sign up/sign in (default `algoanalytics.com`) |
| `ADMIN_EMAIL` | Yes (for seeding) | Becomes the first `ADMIN` account when you run `db:seed` |
| `RESEND_API_KEY` | Optional | Enables email notifications on submission approval/rejection via [Resend](https://resend.com). Without it, the app logs instead of sending |
| `EMAIL_FROM` | Optional | From-address for those emails |
| `LOG_LEVEL` | Optional | `pino` log verbosity (`trace`\|`debug`\|`info`\|`warn`\|`error`\|`fatal`), default `info` |

Anthropic/OpenAI/Gemini/Groq API keys are **not** environment variables —
users paste their own into the Prompt Assistant UI, and each key stays in
that browser tab's `sessionStorage` only (see [Prompt Assistant](#prompt-assistant) below).

## Google OAuth setup (restrict to org)

1. In Google Cloud Console, create an OAuth 2.0 Client ID (Web application).
2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   (and your production URL later).
3. Under "OAuth consent screen", set User type to **Internal** if this is a
   Google Workspace org — this alone restricts login to your org's accounts.
   The app also re-checks the email domain server-side as defense in depth.
   **This step is manual and outside the app's control — verify it directly
   in Google Cloud Console before relying on it**; a misconfigured consent
   screen is the one way an outside Google account could get past the first
   gate.

## Roles & permissions

- `USER` (default): browse/search the library, favorite prompts, submit new
  prompts, propose edits to existing ones — both go into a pending queue.
- `ADMIN`: everything above, plus approve/reject submissions, view the
  analytics dashboard, and manage users (promote/demote,
  activate/deactivate). Every role change, activation/deactivation, and
  submission approval/rejection is recorded in `AdminAuditLog` (actor,
  target, timestamp).
- Promoting/demoting a user only takes effect on their **next sign-in** —
  the session JWT caches the role and isn't re-checked against the database
  on every request (that lookup can't run in the Edge middleware that gates
  `/admin`). If you promote someone, tell them to sign out and back in.

## Prompt Assistant

At `/library/assistant`, users can draft a rough prompt idea and:

- **Find similar prompts** — a lightweight keyword-overlap search against
  every published prompt's title/body (title matches weighted higher), no
  external API calls involved. This is a simple relevance heuristic, not
  semantic search — revisit with Postgres full-text search or pgvector
  embeddings if the library grows past a few thousand prompts.
- **Optimize with their own API key** — Claude, ChatGPT, Gemini, or Groq,
  the user's choice. Each provider's key is kept in `sessionStorage` only
  (cleared when the tab closes) and sent directly to a proxy route
  (`/api/assistant/optimize`) that forwards it to that provider for a single
  request. The key is never written to the database or logged server-side.
  The optimized result can be copied or sent straight into the "Submit a
  prompt" form.

## Project structure

```
prisma/
  schema.prisma              # data model
  migrations/                # applied migrations
  seed.ts                    # creates the first admin + one sample prompt
  seed-library.ts            # loads all seed-prompt-data-*.ts files (idempotent)
  prompt-data*.ts            # the 387 seeded prompts, split into batches
src/
  app/
    (auth)/login, /signup    # auth pages
    library/                 # browse, favorites, new-prompt form, [id] detail, assistant
    admin/                   # dashboard, submissions queue, users
    api/                     # route handlers (prompts, admin, assistant, auth, health)
  components/                # UI components (cards, modal, forms, ui/ primitives)
  lib/                       # auth config, prisma client, rate limiting, logging,
                              # email, tool-recommendation heuristic, text-match scorer
scripts/
  backup-db.ps1 / .sh        # local Postgres dump
.github/workflows/ci.yml     # lint + typecheck + test on push/PR
```

## Operations

- **Health check**: `GET /api/health` — pings the database, returns `503`
  if unreachable. Point uptime monitoring / container readiness probes at
  this.
- **Logs**: structured JSON via `pino` (`src/lib/logger.ts`). Set
  `LOG_LEVEL` to adjust verbosity. Nothing is wired to an external error
  tracker (Sentry, etc.) yet — logs currently go to stdout only.
- **Rate limiting**: a basic in-memory sliding-window limiter
  (`src/lib/rate-limit.ts`) guards `/api/auth/signup` (5 requests / 15 min
  per IP) and `/api/assistant/optimize` (10 requests / min per user). It's
  per-process — fine for a single instance, but swap it for a shared store
  (Redis) before running more than one server instance behind a load
  balancer.
- **Backups**: `npm run db:backup` (or `scripts/backup-db.sh` on
  Linux/macOS) dumps the database to `backups/<timestamp>.sql` via
  `pg_dump`. This is a local file only — for real production use, also push
  the dump somewhere durable and off-machine (S3, a managed Postgres
  provider's own snapshots, etc.), and schedule it to run regularly rather
  than relying on someone remembering to.
- **Security headers**: a CSP and related headers (`X-Frame-Options`,
  `Referrer-Policy`, etc.) are applied in production builds only —
  disabled in `next dev` because a strict `connect-src` breaks the dev
  HMR websocket.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / run it |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest unit suite |
| `npm run db:migrate` | Apply Prisma migrations (interactive, creates new ones from schema changes) |
| `npm run db:seed` | Create the first admin account + one sample prompt |
| `npm run db:seed-library` | Load/refresh the full seeded prompt library (safe to re-run — skips titles that already exist) |
| `npm run db:studio` | Open Prisma Studio (browse/edit the DB directly) |
| `npm run db:backup` | Dump the database to `backups/<timestamp>.sql` |

## Testing & CI

- `npm test` runs the Vitest unit suite: email-domain gating, the
  keyword-search scorer, the tool-recommendation heuristic, the rate
  limiter, and a data-integrity check over every seeded prompt (no
  duplicate titles, every `{{variable}}` matches its declared list both
  ways).
- `.github/workflows/ci.yml` runs lint, typecheck, and tests against a real
  Postgres service container on every push/PR. There's no browser/e2e test
  layer yet — UI changes still need a manual pass in the browser.

## Deploying

There's no deploy pipeline configured yet. In broad strokes: build with
`npm run build`, run with `npm run start` behind your platform's process
manager (or containerize it), point `DATABASE_URL` at a managed Postgres
instance, run `npx prisma migrate deploy` as part of your release step, and
set the same environment variables as local (`AUTH_SECRET` especially
should be a fresh, real secret — not the dev one). Vercel, a VM behind
Docker Compose, or any Node-friendly host all work; pick based on where the
org already runs things.

## Known gaps

- No browser/e2e test coverage — only unit tests for pure logic exist so
  far.
- The keyword search in the library and Prompt Assistant is O(n) over every
  prompt row; fine at hundreds of prompts, will need real indexing
  (Postgres full-text search or embeddings) at much larger scale.
- No external error tracking (Sentry or similar) wired up — errors are
  logged to stdout via `pino` but nothing pages anyone.
- Tool/model recommendations are static heuristics based on category +
  complexity, not usage-driven — worth revisiting once there's real data on
  which tool people actually reach for.
- `npm audit` reports a vulnerability in `@prisma/config`'s dev-only
  dependency tree (via `deepmerge-ts`) — this only affects the Prisma CLI
  tooling at dev time, not the deployed app, and the only fix available is a
  breaking downgrade of `prisma`/`@prisma/client`. Left as-is; revisit when
  Prisma ships a patched release on the current major version.
