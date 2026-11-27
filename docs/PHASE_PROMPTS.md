# PHASE_PROMPTS — copy-paste prompts for Claude, Antigravity and Codex

**Owner ke liye:** har phase mein neeche diye prompt **ek-ek karke** copy karo aur sahi AI ko do.
Ek AI ko ek waqt mein ek hi prompt. Prompt ka kaam poora hone (PR merge) ke baad hi agla do.
Har phase ke end mein "Gate check" prompt Claude ko do. Gate pass hone par hi agla phase.

Every prompt below already tells the AI to read AGENTS.md, follow DECISIONS.md and update PROGRESS.md.
The whole product UI is in simple English (DECISIONS #28).

---

## The standard header (already inside every prompt)
> Read AGENTS.md, docs/DECISIONS.md, docs/ARCHITECTURE.md and docs/PROGRESS.md first.
> Claim the task in PROGRESS.md as `[~] (<your agent name>, <date>)`. Work on branch `<agent>/<task-slug>`.
> Follow all golden rules. Write tests. Run `pnpm lint && pnpm typecheck && pnpm test`.
> When done: mark `[x]`, add a Handoff Log entry (what you did, files, how to test, open questions), open a PR.

---

## Phase 0 — Foundation (1–2 weeks)

**P0-1 → Claude**
> [standard header] Task: finish the monorepo foundation. pnpm workspaces + Turborepo, TypeScript strict, ESLint,
> Prettier, Vitest. Shared tsconfig in `packages/config`. Make `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
> work from the root. Add GitHub Actions CI that runs them on every PR.

**P0-2 → Claude**
> [standard header] Task: `packages/core` helpers — UUID v7, money in integer paise (add, multiply by qty,
> percentage, GST split, round-off to nearest rupee, format ₹), Indian financial year (Apr–Mar) and bill-number series
> helpers. 100% unit-test coverage for money. No floats anywhere.

**P0-3 → Claude**
> [standard header] Task: `packages/db` Drizzle schema for core tables in ARCHITECTURE.md §3 (tenants, companies,
> outlets, devices, users, roles, items, units, parties, ledgers, vouchers, voucher_items, stock_moves, ledger_entries,
> bill_series, outbox, audit_log, activity_log). Every table: id UUID v7, tenant_id, company_id, outlet_id where needed,
> created_at, updated_at. Same schema for SQLite (money = integer paise) and Postgres (NUMERIC(14,2)). Migrations for both.

**P0-4 → Claude**
> [standard header] Task: voucher engine in `packages/core` — `postSale`, `postReturn`, `cancelVoucher`, `postReceipt`.
> One DB transaction writes voucher + items + stock_moves + balanced ledger_entries + next bill number + outbox row.
> Idempotent by voucher id. Cancel never deletes: status=cancelled + reason + reverse entries + audit_log.

**P0-5 → Codex**
> [standard header] Task: tests for the voucher engine — sale, return, cancel, partial payment, discount, round-off,
> intra-state (CGST+SGST) and inter-state (IGST) GST, same bill posted twice (must create one bill), crash in the middle
> of a transaction (nothing saved). Debits must always equal credits.

**P0-6 → Codex**
> [standard header] Task: error log system per DECISIONS #23 in `packages/core/errors`: error codes, simple English
> "What happened / Why / How to fix" text in `en.json`, local error table, Sentry hook (DSN from env), no customer data.

**P0-7 → Antigravity**
> [standard header] Task: `packages/ui` base — design tokens (accent #1E40AF, Inter font), Button, Input, Select,
> Table, Modal, Toast, top bar with logo + business name slot, keyboard shortcut helper, i18n with `en.json` only.
> Storybook-style demo page. Simple English labels.

**Gate check → Claude**
> Read AGENTS.md, PROGRESS.md and MASTER_PLAN.md Step 4. Check Phase 0 gate: CI green, voucher engine tests pass,
> debit = credit in all tests, duplicate post creates one bill. Run everything. Report PASS/FAIL with reasons and
> list any missing task. Do not start Phase 1.

---

## Phase 1 — Offline billing desktop + installer (3–4 weeks)

**P1-1 → Claude** `apps/desktop` Tauri 2 + React shell, local SQLite (WAL, synchronous=FULL), startup `quick_check`,
owner login + staff PIN, Windows installer (MSI/EXE) build in CI, signed auto-updater wiring (DECISIONS #16).

**P1-2 → Antigravity** Setup wizard (10 steps, DECISIONS #20): activate, business type, business details + logo upload,
outlets/counters, printer, tax + bill design live preview, import, users, backup/WhatsApp (skip allowed), test bill.
Logo + business name shown in top bar, login screen, bills, reports.

**P1-3 → Antigravity** Masters screens: items, units, HSN, parties, ledgers, godowns. Keyboard-first forms.

**P1-4 → Antigravity** Billing screen (keyboard-only possible, DECISIONS #22): item search F3, barcode, qty, rate,
discount, cash/UPI/credit/split, save Ctrl+S, print Ctrl+P, Alt+G "Go to" search, F1 shortcut list.
Draft autosave every 3 s + "Restore unfinished bill" on restart (rule 15).

**P1-5 → Claude** Printer module (DECISIONS #21): detect Windows/USB/LAN 9100/Bluetooth printers, ESC/POS 58/80 mm,
A4/A5 via HTML-to-PDF, document-to-printer mapping per counter, client can change and save, print queue with status,
retry/reprint/clear stuck queue/backup printer/save as PDF, simple English errors. Bill saved before print.

**P1-6 → Codex** Bulk upload (DECISIONS #26): Excel/CSV templates for items, menu, opening stock, parties, staff,
tables, rooms, price lists; preview + error rows with reason; starter lists for grocery and restaurant.

**P1-7 → Claude** Purchase, purchase return, stock balance, low stock, godown transfer, cancel register, edit history.

**P1-8 → Codex** Local backup: weekly full + daily incremental `.erpbak` (zstd + AES), restore with check (STORAGE.md).

**P1-9 → Codex** Power-cut tests: kill app during typing, save, print and sync; 1000-bill run; no lost/duplicate bill.

**Gate check → Claude** 1000 bills, power-cut tests pass, no lost bill, installer installs and updates cleanly,
printer works on one 80 mm thermal + one A4 printer, full billing possible without mouse.

---

## Phase 2 — Accounts, GST, reports (3–4 weeks)

**P2-1 → Claude** Receipts, payments, journal, contra, party ledger, credit (udhaar) ageing.
**P2-2 → Claude** GST engine: CGST/SGST/IGST, HSN summary, GSTR-1 JSON, GSTR-3B summary, period lock after filing.
**P2-3 → Antigravity** Reports UI framework (filters, date range, export Excel/PDF, print) + first 30 reports.
**P2-4 → Codex** Remaining reports to 70+ (list in COMPETITORS.md/ARCHITECTURE.md), all reading only from entries.
**P2-5 → Codex** Tally XML export + CA export pack (ledgers, vouchers, GST).
**P2-6 → Claude** Nightly self-check: books balance, stock = moves, cash = cash ledger, GST = invoice tax; alert on mismatch.
**Gate check → Claude** CA checks one sample month; trial balance tallies; GSTR-1 JSON validates on the offline tool.

---

## Phase 3 — Cloud, sync, website, Super Admin, licence (4–6 weeks)

**P3-1 → Claude** `apps/api` Hono: auth per DECISIONS #12 (ID + password, stay logged in, lock after 5 tries,
devices list, remote logout), tenants, Postgres RLS, tenant_id only from token. Test "shop A can never read shop B".
**P3-2 → Claude** `packages/sync`: outbox push/pull, Idempotency-Key, batches, retry, LAN hub mode.
**P3-3 → Antigravity** `apps/web` client web app/PWA: login, shop picker, billing (W- series), "PC offline" banner, reports.
**P3-4 → Antigravity** `apps/admin` Super Admin (DECISIONS #13, #27): clients, plans, modules on/off, limits, suspend,
usage counts, Login ID view, temporary password, support mode, app versions, WhatsApp status, error dashboard.
**P3-5 → Claude** `packages/licence`: Ed25519 tokens, device binding, 7-day check, clock guard, grace → read-only,
offline device-code activation.
**P3-6 → Codex** Activity log (screens 7 days, clicks 3 days) + permanent money audit (DECISIONS #25) + owner viewer.
**P3-7 → Codex** Release system (DECISIONS #16): staging, 5% ring, update popup, API versioning, feature flags, rollback.
**P3-8 → Codex** Razorpay Subscriptions + manual payment + GST invoice; Google Drive backup upload.
**P3-9 → Claude** Multi-outlet model (DECISIONS #19) in core + sync.
**Gate check → Claude** 3 devices × 1000 bills, zero duplicates, restore test, RLS isolation test, licence expiry test.

---

## Phase 4 — Pilot (4 weeks, 3–5 shops in Orai)
**P4-1 → Codex** Pilot checklist from MASTER_PLAN.md Step 5; daily mismatch report script.
**P4-2 → all** Fix pilot bugs only (no new features). Each bug: reproduce test first, then fix.
**Gate check → Claude** 30 days zero mismatch, shop owners satisfied, no lost bill.

---

## Phase 5 — WhatsApp, SMS, QR, AI (3–4 weeks)
**P5-1 → Claude** `apps/whatsapp` Baileys (`@whiskeysockets/baileys` only): payment receipt to customer, daybook to owner
at set time, queue + retry, rate limit, SMS fallback. Status green/yellow/red + reconnect (DECISIONS #17).
**P5-2 → Codex** MSG91 OTP/receipt SMS (DLT), Resend email fallback, OTP order per DECISIONS #12.
**P5-3 → Antigravity** `apps/shop-page` QR order page + direct UPI + owner notification; misuse protection (DECISIONS #14).
**P5-4 → Antigravity** Staff attendance: 30-second rotating QR, device binding, GPS, "Doubtful" flag; reward points.
**P5-5 → Claude** AI helper (DECISIONS #24): Gemini returns intent only, app runs reports; no client data on free tier.
**Gate check → Claude** Receipts + daybook 2 weeks without ban; QR fake-order tests pass.

---

## Phase 6 — Packs + Android (6–8 weeks)
**P6-1 → Claude** Plugin SDK (hooks, fields, UI slots) finalised. **P6-2** Wholesale pack. **P6-3** Pharma pack.
**P6-4** Garment pack. **P6-5 → Claude + Antigravity** HoReCa One pack: tables, KOT, table QR safety (DECISIONS #18),
outlets Rooms/Restaurant/Bar/Cafe, "Add to room" folio. **P6-6 → Codex** integrations hub (UrbanPiper, channel manager).
**P6-7 → Antigravity** Android app (Tauri mobile or Capacitor; decide in DECISIONS first).
**Gate check → Claude** each pack has one pilot client live.

---

## Daily prompts
- **Review a PR (Claude):** "Read AGENTS.md. Review PR #<n> for golden-rule breaks, money/stock/GST correctness,
  tenant isolation and missing tests. List must-fix and nice-to-have."
- **Bug (Codex):** "Read AGENTS.md. Bug: <what happened, screen, steps>. Write a failing test first, then fix, then PR."
- **Status (any):** "Read PROGRESS.md and Handoff Log. Tell me in 5 lines: done this week, in progress, blocked, next."
