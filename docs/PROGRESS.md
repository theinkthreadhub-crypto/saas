# PROGRESS — the shared task board

Legend: `[ ]` todo · `[~] (agent, date)` in progress · `[x]` done · `[!]` blocked (write why)
Agents: `claude` · `antigravity` · `codex`. Claim ONE task at a time. Update this file in the same PR as the work.

**Current phase:** Phase 0 — Foundation
**Last updated:** 2026-11-27 by claude

---

## Phase 0 — Foundation
- [ ] Error log system per DECISIONS #23 (codes, simple English fix steps, Sentry)
- [x] Monorepo setup: pnpm + Turborepo, TypeScript strict, ESLint, Prettier (claude, 2026-11-27)
- [x] GitHub Actions CI: lint, typecheck, unit tests on every PR (claude, 2026-11-27)
- [x] `packages/db`: Drizzle schema for core tables (see ARCHITECTURE.md §3), SQLite + Postgres migrations (claude, 2026-11-27)
- [x] UUID v7 helper, money helper (paise ↔ rupees, rounding), date/fin-year helper + tests (claude, 2026-11-27)
- [ ] `packages/core`: voucher engine (one transaction: voucher + items + stock_moves + ledger_entries + bill_no + outbox)
- [ ] Unit tests for voucher engine: sale, return, cancel, partial payment, discount, round-off
- [ ] i18n setup (English only, en.json) in `packages/ui`

## Phase 1 — Offline billing (desktop)
- [ ] Setup wizard + branding (logo/name everywhere) per DECISIONS #20
- [ ] Printer module per DECISIONS #21 (detect, mapping, client can change + save, queue, errors, PDF fallback)
- [ ] Keyboard billing + Alt+G go-to per DECISIONS #22
- [ ] Bulk upload Excel/CSV + starter item lists per DECISIONS #26
- [ ] `apps/desktop` Tauri shell + React, local SQLite (WAL), login with PIN
- [ ] Masters: items, parties, ledgers, units, HSN, godowns (+ Excel import)
- [ ] Billing screen: keyboard-first, barcode, cash/UPI/credit, discount, print (58/80 mm, A4/A5)
- [ ] Purchase entry + purchase return
- [ ] Stock: balance, low stock, godown transfer
- [ ] Power-cut safety: WAL + synchronous=FULL, draft autosave + restore prompt, startup quick_check, resume sync, reprint
- [ ] Test: kill app/power during typing, during save, during print, during sync → no lost or duplicate bill
- [ ] Cancel with reason + register + edit history
- [ ] Local backup: weekly full + daily incremental, zstd + AES (see STORAGE.md)
- [ ] Setup wizard + first business templates (kirana, distributor)

## Phase 2 — Accounts, GST, reports
- [ ] Receipts, payments, journal, contra; party ledger; udhaar ageing
- [ ] Day book, cash book, bank book, trial balance, P&L, balance sheet
- [ ] GST engine (CGST/SGST/IGST, HSN), GSTR-1 JSON, GSTR-3B summary, HSN summary
- [ ] Tally XML export
- [ ] Nightly self-check (books, stock, cash, GST) + alerts
- [ ] Period lock after GST filing

## Phase 3 — Cloud, sync, Super Admin, licence
- [ ] Activity log (screens 7 days, clicks 3 days) + permanent money audit per DECISIONS #25
- [ ] Super Admin full control + support mode + new-client cloud setup flow per DECISIONS #27
- [ ] `apps/api` Hono: auth (JWT, OTP), tenants, Row Level Security
- [ ] Login per DECISIONS #12: ID + password, stay logged in until logout, no OTP on normal login; OTP only for reset / Super Admin / optional 2-step
- [ ] Web login privacy: tenant_id only from the login token (never from URL/form), RLS on every table, automated test "shop A can never read shop B", new-device alert to owner, active sessions list + remote logout, "public computer" mode (no remember-me)
- [ ] Multi-shop users (owner with 2 shops, CA): shop picker after login
- [ ] Web billing while desktop PC is off: separate web bill series (W-0001), banner "PC offline, last sync <time>"
- [ ] `packages/sync`: outbox push/pull, idempotency, batches, retry
- [ ] LAN hub mode for multi-counter shops
- [ ] `packages/licence`: Ed25519 signed tokens, device binding, 7-day check, clock guard, read-only mode
- [ ] Razorpay Subscriptions + manual payment + GST invoice to client
- [ ] `apps/admin` Super Admin: clients, plans, licences, packs on/off, backup monitor, health
- [ ] Super Admin usage analytics: bill COUNT per client (today/week/month), last bill/login/sync, active devices/users, feature usage, 30-day trend, "no bills for 3 days" alert. Counts only — never amounts, customer names or bill details (privacy)
- [ ] Super Admin password reset: owner-role only, temporary password (must change at first login), callback verification note, SMS/WhatsApp alert to client owner, audit log. Super Admin itself always needs password + OTP/authenticator
- [ ] Super Admin client page per DECISIONS #13: show Login ID/role/status/last login (never password), "Temporary password banao" (24 hr, single use), force "Naya password banao" on next login, logout old sessions, owner alert, audit log of every view/reset
- [ ] Release system per DECISIONS #16: staging, 5% pilot ring, Tauri signed auto-updater (no update during billing), Play staged rollout, API versioning, expand-migrate-contract migrations with auto-backup, feature flags, app-version column in Super Admin, rollback drill
- [ ] User Master (client side): users with login ID, PIN/password, role; default roles (Owner, Manager, Cashier, Storekeeper, Accountant/CA, Salesman) + custom roles; permission matrix module × action (view/create/edit/cancel/export); limits: max discount %, hide purchase rate/profit, godown/counter scope, login hours, device restriction, owner PIN for cancel/rate change; every change audited + owner notified
- [ ] Cloud backup to R2 + Google Drive (server-side), retention, restore test
- [ ] `apps/web` owner dashboard (PWA)

## Phase 4 — Pilot (3–5 shops, Orai)
- [ ] Pilot install, parallel run with old software, CA review
- [ ] Gate: 30 days zero mismatch

## Phase 5 — Communication + QR
- [ ] AI helper (Gemini intent-only, no client data on free tier) per DECISIONS #24
- [ ] `apps/whatsapp` Baileys service: receipt + owner daybook, rate limit, SMS fallback
- [ ] MSG91 OTP + receipt SMS (DLT templates)
- [ ] Shop QR order page + client notification + direct UPI
- [ ] Staff QR attendance (rotating QR, GPS, selfie) + reports
- [ ] Reward points
- [ ] QR misuse protection per DECISIONS #14: accept-before-stock, 15-min auto-cancel, shop-only GPS mode, mobile check for home orders, limits + Turnstile, fake-block list, dynamic 30-sec attendance QR, device binding, GPS check, doubtful flag
- [ ] WhatsApp status icon per DECISIONS #17: green/yellow/red in top bar, tap to reconnect, queue while red, 30-min alert, status column in Super Admin

## Phase 6 — Packs
- [ ] Wholesale pack (scheme, party rates, salesman, route, credit limit)
- [ ] Pharma pack (batch, expiry, salt, Schedule H register)
- [ ] Garment pack (size-colour matrix, label print)
- [ ] HoReCa One pack (table, KOT, table QR) + integrations hub (UrbanPiper, channel manager)
- [ ] Table QR safety per DECISIONS #18: table session open/close, pending-waiter-check before first KOT, auto close on bill, optional GPS/Wi-Fi check, prepaid takeaway
- [ ] Multi-outlet per DECISIONS #19: company/outlet model, per-outlet series/stock/tax/printer/staff, post-to-room folio, stock transfer, combined + per-outlet reports
- [ ] Android app build

---

## Questions for owner
- (agents add questions here; owner answers inline)
- (claude) Login ID is unique across ALL clients (one mobile number = one login everywhere). OK, or should the same mobile be allowed as a login in two different client accounts?

---

## Handoff Log (newest on top)
Template:
```
### YYYY-MM-DD — <agent> — <task>
Done: ...
Files: ...
Left / next step: ...
Warnings: ...
```

### 2026-11-27 — claude — P0-3 `packages/db` schema + migrations
- Done: Drizzle schema for 19 core tables (tenants, companies, outlets, devices, roles, users, units, items, godowns,
  ledgers, parties, bill_series, vouchers, voucher_items, stock_moves, ledger_entries, outbox, audit_log, activity_log).
  Same table files for SQLite and Postgres; only `dialect.ts` differs (DECISIONS #30). First migration `0000_core_tables`
  for both. DB-level guards: unique bill no `(company_id, fin_year, series, bill_no)`, unique device series per company,
  cancelled voucher needs reason + time, ledger line is debit XOR credit and > 0, stock move qty ≠ 0, enum CHECKs, FKs.
- Tests (69): migrations run on node:sqlite and PGlite (DECISIONS #31); same constraint suite on both; paise ↔ NUMERIC
  round trip through Drizzle; schema parity; golden rule 5 columns; no float columns.
- Files: `packages/db/**`, root `package.json` (db:generate), `.prettierignore`, `eslint.config.js`, AGENTS.md §8, DECISIONS #30–31.
- How to test: `pnpm install && pnpm lint && pnpm typecheck && pnpm test`. After any schema edit: `pnpm db:generate`.
- Left / next: P0-4 voucher engine (uses `bill_series.next_no` inside the voucher transaction). `pnpm db:migrate` runner
  is not built yet (`src/migration-files.ts` already reads the SQL in order). Postgres RLS policies are P3-1.
  audit_log is append-only by rule but not yet blocked by a DB trigger. Not in this task: licences, item_batches,
  stock_balance, daily_summary, settings, company_packs, user→company access (later tasks).
- Warnings: edit a table file in `src/sqlite/` AND copy it to `src/pg/` (test enforces). On Postgres, raw SQL money
  literals are rupees; always go through Drizzle so code sees paise. `node:sqlite` needs Node ≥ 22.13.

### 2026-11-27 — claude — Phase 0 start: monorepo + core helpers
- Done: pnpm workspaces + Turborepo, TS strict base config (`packages/config`), ESLint (typescript-eslint strict) + Prettier,
  GitHub Actions CI (`.github/workflows/ci.yml`), `packages/core`: money in paise (parse, line amount, %, GST split,
  round-off, ₹ format), UUID v7, Indian financial year, bill number format/parse. 18 unit tests pass.
- How to test: `pnpm install && pnpm lint && pnpm typecheck && pnpm test`
- Next: P0-3 (`packages/db` schema) → P0-4 (voucher engine). See docs/PHASE_PROMPTS.md.
- Open question for owner: product name (DECISIONS #11) — code uses `setupro-erp` / `@setupro/*` until decided.

### 2026-11-27 — owner — project kit created
Done: AGENTS.md, CLAUDE.md, docs (VISION, ARCHITECTURE, COMPETITORS, STORAGE, TESTING, DECISIONS, PROGRESS).
Left / next step: start Phase 0, first task "Monorepo setup".
