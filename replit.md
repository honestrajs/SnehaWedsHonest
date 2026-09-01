# Our Wedding Fund

A private shared savings tracker for Sneha and Honest to build their INR wedding fund together.

## Run & Operate

- Copy `artifacts/api-server/.env.example` -> `artifacts/api-server/.env` and `lib/db/.env.example` -> `lib/db/.env`, filling in the Supabase `DATABASE_URL` in both.
- `pnpm install` — install all workspace dependencies (run once, and again after adding deps)
- `pnpm --filter @workspace/db run push` — push DB schema to Supabase (dev only)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/wedding-savings run dev` — run the frontend (Vite dev server)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env (`.env`, git-ignored): `DATABASE_URL` — Supabase Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: Supabase (hosted PostgreSQL) + Drizzle ORM, connected via a standard `pg` connection string
- Hosting plan: Vercel (frontend + API), custom domain via GoDaddy — not wired up yet
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (ESM bundle)

## Where things live

 - `artifacts/wedding-savings/src/App.tsx` — login, dashboard, contribution form, and responsive UI
 - `artifacts/wedding-savings/src/index.css` — wedding fund theme, typography, texture, and motion
 - `artifacts/api-server/src/routes/wedding.ts` — session login and savings API
  - `artifacts/wedding-savings/src/assets/our-story.png` — bundled couple portrait shown permanently in the app
 - `lib/db/src/schema/wedding.ts` — shared contribution table
 - `lib/api-spec/openapi.yaml` — source of truth for the API contract

## Architecture decisions

- Shared contributions are persisted in PostgreSQL so both couple logins see the same ledger.
- Contributions are deliberately presented as “Both of us” rather than attributed to one partner.
- The two requested couple credentials are handled by a small session-based private login.
- The couple portrait is bundled with the web artifact (`assets/our-story.png`) so it is always shown without an in-app upload flow — swap the file locally to change the photo, no re-upload needed.
- Money is stored as integer paise/cents in the database to avoid floating-point total errors.
- The target and wedding date are constants for this wedding plan; dashboard calculations are derived server-side.
- `artifacts/api-server/src/routes/storage.ts` (Replit object storage, presigned uploads) is leftover from the original Replit scaffold and is unused/non-functional now that we're off Replit — safe to ignore or delete once Supabase is fully wired up.

## Product

- Bride and groom can sign in separately using the requested names and password.
- Each person can save an amount, date and time, category, and a personal summary.
- The dashboard shows total saved, percentage progress toward INR 10,00,000, remaining amount, monthly pace, a live Days:Hours:Minutes:Seconds countdown under the photo, shared recent entries, and a brush-painted photo memory.

## User preferences

- The user asked for a romantic Christian wedding theme for Sneha Christy C and Honest Raj S.
- Wedding date is July 14, 2027; target budget is INR 10,00,000.

## Gotchas

- Use `pnpm --filter @workspace/api-spec run codegen` after OpenAPI changes.
- API and web services are managed by their existing artifact workflows; restart those workflows after code changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
