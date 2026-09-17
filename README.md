# Prompt Library

Internal prompt library for AlgoAnalytics. Everyone with an `@algoanalytics.com`
account can sign in (Google login or email/password) and browse/search/submit
prompts. Admins get an approval workflow, dashboard, and user management.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- NextAuth v5 (Google OAuth + Credentials, both restricted to the org email domain)
- Prisma + PostgreSQL
- Vitest (unit tests) + GitHub Actions CI

## First-time setup

1. Start Postgres:

   ```bash
   docker compose up -d
   ```

2. Copy `.env.example` to `.env` and fill in:
   - `AUTH_SECRET` — generate with `npx auth secret`
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — from a Google Cloud OAuth client
     restricted to your Workspace org (see below)
   - `ADMIN_EMAIL` — the email that becomes the first admin
   - `RESEND_API_KEY` / `EMAIL_FROM` — optional; enables email notifications
     on submission approval/rejection (see below). The app runs fine without
     these, it just logs instead of sending.

3. Install dependencies and run migrations:

   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   ```

   The seed script creates the first admin account with password
   `ChangeMe123!` — change it after first login (or just use Google login,
   which will pick up the ADMIN role since the email matches).

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Google OAuth setup (restrict to org)

1. In Google Cloud Console, create an OAuth 2.0 Client ID (Web application).
2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   (and your production URL later).
3. Under "OAuth consent screen", set User type to **Internal** if this is a
   Google Workspace org — this alone restricts login to your org's accounts.
   The app also re-checks the email domain server-side as defense in depth.
   **This step is manual and outside the app's control — verify it directly in
   Google Cloud Console before relying on it; a misconfigured consent screen
   is the one way an outside Google account could get past the first gate.**

## Prompt Assistant

At `/library/assistant`, users can draft a rough prompt idea and:

- **Find similar prompts** — a lightweight keyword-overlap search against every
  published prompt's title/body (title matches weighted higher), no external
  API calls involved. This is a simple relevance heuristic, not semantic
  search — revisit with Postgres full-text search or pgvector embeddings if
  the library grows past a few thousand prompts.
- **Optimize with their own API key** — Claude, ChatGPT, Gemini, or Groq, the
  user's choice. Each provider's key is kept in `sessionStorage` only (cleared
  when the tab closes) and sent directly to a proxy route
  (`/api/assistant/optimize`) that forwards it to that provider for a single
  request. The key is never written to the database or logged server-side.
  The optimized result can be copied or sent straight into the "Submit a
  prompt" form via `sessionStorage`.

## Roles

- `USER` (default): browse/search the library, submit new prompts, propose
  edits to existing prompts — both go into a pending queue.
- `ADMIN`: everything above, plus approve/reject submissions, view the
  analytics dashboard, and manage users (promote/demote, activate/deactivate).
  Every role change, activation/deactivation, and approval/rejection is
  recorded in the `AdminAuditLog` table (actor, target, timestamp).
- Promoting/demoting a user only takes effect on their **next sign-in** — the
  session JWT caches the role and isn't re-checked against the database on
  every request (that lookup can't run in the Edge middleware that gates
  `/admin`). If you promote someone, tell them to sign out and back in.

## Operations

- **Health check**: `GET /api/health` — pings the database, returns `503` if
  unreachable. Point uptime monitoring / container readiness probes at this.
- **Logs**: structured JSON via `pino` (`src/lib/logger.ts`). Set `LOG_LEVEL`
  (default `info`) to adjust verbosity. Nothing is wired to an external error
  tracker (Sentry, etc.) yet — logs currently go to stdout only.
- **Rate limiting**: a basic in-memory sliding-window limiter
  (`src/lib/rate-limit.ts`) guards `/api/auth/signup` (5 requests / 15 min per
  IP) and `/api/assistant/optimize` (10 requests / min per user). It's
  per-process — fine for a single instance, but swap it for a shared store
  (Redis) before running more than one server instance behind a load balancer.
- **Backups**: `npm run db:backup` (or `scripts/backup-db.sh` on
  Linux/macOS) dumps the database to `backups/<timestamp>.sql` via
  `pg_dump`. This is a local file only — for real production use, also push
  the dump somewhere durable and off-machine (S3, a managed Postgres
  provider's own snapshots, etc.), and schedule the script to run regularly
  rather than relying on someone remembering to run it.
- **Email notifications**: submission approval/rejection emails send via the
  [Resend](https://resend.com) HTTP API if `RESEND_API_KEY` is set, otherwise
  they no-op and just log. (Deliberately not using `nodemailer`/SMTP — it
  currently carries several unpatched high-severity advisories upstream.)

## Testing & CI

- `npm test` runs the Vitest unit suite (pure logic: email-domain gating,
  the keyword-search scorer, the tool-recommendation heuristic, the rate
  limiter, and a data-integrity check over every seeded prompt — no
  duplicate titles, every `{{variable}}` matches its declared list).
- `.github/workflows/ci.yml` runs lint, typecheck, and tests against a real
  Postgres service container on every push/PR. There's no browser/e2e test
  layer yet — UI changes still need a manual pass in the browser.

## Notes / known gaps

- No browser/e2e test coverage — only unit tests for pure logic exist so far.
- The keyword search in the library and Prompt Assistant is O(n) over every
  prompt row; fine at hundreds of prompts, will need real indexing
  (Postgres full-text search or embeddings) at much larger scale.
- No external error tracking (Sentry or similar) wired up yet — errors are
  logged to stdout via `pino` but nothing pages anyone.
- `npm audit` reports vulnerabilities in `@prisma/config`'s dev-only
  dependency tree (via `deepmerge-ts`) — this only affects the Prisma CLI
  tooling at dev time, not the deployed app, and the only fix available is a
  breaking downgrade of `prisma`/`@prisma/client`. Left as-is; revisit when
  Prisma ships a patched release on the current major version.
