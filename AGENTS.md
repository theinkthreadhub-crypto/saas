# AGENTS.md — SetuPro ERP (single source of truth for ALL AI agents)

This file is read by **Claude Code** (via CLAUDE.md import), **Google Antigravity** and **OpenAI Codex**.
Three different AIs work on this repo. Follow these rules exactly so the work stays consistent.

## 1. What we are building (one paragraph)
A **multi-business billing + inventory + accounting + GST SaaS** for Indian small businesses
(kirana, wholesale/distributor, pharmacy, garment, hotel/restaurant, school, and more).
**One codebase**: a common **Core** + **Industry Packs** (plugins) + **Business Templates**.
Works **offline-first** (desktop, local SQLite) and **online** (cloud Postgres), with a
**Super Admin** panel for the owner company (SetuPro, setupro.in).
Product name: **TBD** (shortlist in docs/DECISIONS.md). Code name: `setupro-erp`.

Full vision: `docs/VISION.md` · Architecture: `docs/ARCHITECTURE.md` · Competitors: `docs/COMPETITORS.md`

## 2. Before you write ANY code (mandatory)
1. Read `docs/PROGRESS.md` — what is done, what is in progress, who is doing what.
2. Read `docs/DECISIONS.md` — never contradict a recorded decision. To change one, add a new entry.
3. Pick **one** task from PROGRESS.md marked `[ ]` (todo) that is not claimed.
4. Claim it: change it to `[~] (agent-name, date)` and commit that change first.

## 3. After you finish a task (mandatory)
1. Mark it `[x]` in `docs/PROGRESS.md`.
2. Add a short entry to the **Handoff Log** at the bottom of PROGRESS.md:
   what you did, files touched, what is left, any warnings for the next agent.
3. If you made an architecture/library/naming choice, add it to `docs/DECISIONS.md`.
4. All tests must pass (`pnpm test`). Never mark done with failing tests.

## 4. Agent identity
Use your name in commits, branches and logs:
- Claude Code → `claude` · Google Antigravity → `antigravity` · OpenAI Codex → `codex`
- Branch: `<agent>/<short-task>` e.g. `codex/sale-return`
- Commit: `[<agent>] <what changed>` e.g. `[claude] add stock_balance trigger`
- Never push directly to `main`. Open a PR. Never rewrite another agent's open branch.

## 5. Tech stack (do not change without a DECISIONS.md entry)
| Layer | Choice |
|---|---|
| Language | TypeScript everywhere (strict mode) |
| Monorepo | pnpm workspaces + Turborepo |
| UI | React + Tailwind (shared in `packages/ui`) |
| Desktop app | Tauri 2 (Windows .msi/.exe; Android later) |
| Local DB | SQLite (WAL mode) |
| Cloud DB | PostgreSQL on Neon |
| ORM | Drizzle (same schema for SQLite + Postgres) |
| Backend API | Hono (runs on Cloudflare Workers now, Node/VPS later — keep it portable) |
| Background jobs | Cloudflare Cron Triggers / Queues / Workflows |
| File storage | Cloudflare R2 (S3-compatible API only) |
| Web / PWA / Super Admin hosting | Cloudflare Pages |
| WhatsApp | Separate small Node service using `@whiskeysockets/baileys` on a VPS |
| SMS | MSG91 (DLT templates) |
| Payments (our SaaS fees) | Razorpay Subscriptions |
| Tests | Vitest (unit), Playwright (E2E), k6 (load) |

## 6. Golden rules (never break these)
1. **Offline first.** A bill is saved to local SQLite in ONE transaction, then printed, then synced. Billing must never wait for the internet.
2. **One transaction per business action.** Bill + stock move + ledger entries + bill number are written together or not at all.
3. **Never hard-delete vouchers** (bills, receipts, payments). Use `status='cancelled'` + reason + reverse entries + audit log.
4. **Money is `NUMERIC(14,2)`** (Postgres) / integer paise (SQLite). Never `float`/`double` for money.
5. **Every table has `id` (UUID v7), `tenant_id`, `company_id`, `created_at`, `updated_at`.**
6. **Idempotency:** bill UUID is created when the bill screen opens; inserts use `ON CONFLICT (id) DO NOTHING`; sync requests carry `Idempotency-Key`.
7. **Bill numbers:** per-device series (A-0001, B-0001), unique constraint `(company_id, fin_year, series, bill_no)`.
8. **Reports read from ledger/stock entries only.** Never keep separate hand-calculated totals (summary tables are rebuilt from entries and verified nightly).
9. **Packs never touch core tables directly.** Use hooks, `attributes` JSONB, UI slots. Only Core posts to the ledger.
10. **Portable code only.** No vendor lock-in: standard SQL, S3 API, Hono, env vars for every URL/key. Must run on Cloudflare AND on a plain VPS in Docker.
11. **Secrets never in code or in the client app.** Use env vars / Wrangler secrets. Google Drive and WhatsApp credentials live only on the server.
12. **Keep it simple.** No new library/framework/service without a DECISIONS.md entry explaining why.
13. **Small files, clear names.** One module = one folder. Functions < 60 lines where possible.
14. **Tests with every feature.** Business logic (money, stock, GST) needs unit tests covering sale, return, cancel, partial payment, discount, inter-state GST.
15. **Power-cut safe.** SQLite: `journal_mode=WAL`, `synchronous=FULL`. Show "Saved" only after commit. Bill cart autosaves as a draft every few seconds; on restart offer "restore unfinished bill". Bill number is taken inside the commit (no gaps). On every app start: `PRAGMA quick_check`, then resume pending outbox sync. Re-sending is safe because of idempotency (rule 6).

## 7. Repo layout
```
apps/
  desktop/        Tauri shell (offline billing counter)
  web/            Client web app + PWA (owner/staff/mobile)
  admin/          Super Admin panel (SetuPro team)
  api/            Hono backend (sync, licence, auth, reports, integrations)
  whatsapp/       Baileys service (receipts + daybook only)
  shop-page/      Public QR order page (customer scans shop QR)
packages/
  core/           Business logic: billing, stock, ledger, GST, reports (pure TS, no UI)
  db/             Drizzle schema + migrations (SQLite + Postgres)
  sync/           Outbox, push/pull, conflict rules
  licence/        Signed licence tokens, device binding, plan checks
  ui/             Shared React components
  plugin-sdk/     Hooks, fields, UI slots API for packs
packs/            grocery/ wholesale/ pharma/ garment/ hotel/ school/ ...
templates/        Business templates (JSON): medical-store, kirana, distributor ...
docs/             VISION, ARCHITECTURE, COMPETITORS, PROGRESS, DECISIONS, TESTING, STORAGE
```

## 8. Commands
```
pnpm install          # install
pnpm dev              # run all apps locally
pnpm test             # unit tests (must pass before PR)
pnpm test:e2e         # Playwright
pnpm lint && pnpm typecheck
pnpm db:migrate       # apply migrations to the DB in .env.local (direct URL)
pnpm test:live        # live tests against Neon (writes are rolled back)
pnpm --filter @setupro/db db:generate   # make a new migration after changing the schema
```
(If a command does not exist yet, create it and record it here.)

## 9. Language
Code, comments, commit messages: **English**.
User-facing text: **simple English only** (DECISIONS #28) — app, bills, errors, messages, help.
Still use i18n keys (`packages/ui/i18n/en.json`); never hardcode UI strings, so another language can be added later.

## 10. When unsure
Do not guess business rules (GST, accounting, pharma law). Write the question in the Handoff Log
under "Questions for owner" and pick the safest simple option, clearly marked `// TODO(owner):`.
