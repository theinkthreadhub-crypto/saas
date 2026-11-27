# CLAUDE_CODE_PROMPTS — ek-ek karke Claude Code ko do

**Owner ke liye niyam:**
1. Ek prompt do → Claude Code PR banayega → PR check/merge karo → tabhi agla prompt.
2. Har prompt ke end mein Claude Code proof (test output) dega. Test fail ho to agla prompt mat do — bolo "fix the failing tests".
3. Har 5 prompt ke baad **"Status check"** prompt do (sabse neeche).
4. Claude Code ke environment settings mein ye secrets daalo (code mein kabhi nahi):
   `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `DB_DRIVER` (cloud par `neon-ws`, apne PC par `pg`).

Every prompt starts with the same rule line. Copy the whole block.

---

## PHASE 0 — Foundation

### 01 — Core schema (all tables)
```
Read AGENTS.md, docs/DECISIONS.md, docs/ARCHITECTURE.md, docs/PROGRESS.md. Follow the task workflow (claim, branch claude/<slug>, tests, PROGRESS + Handoff Log, PR).
Task: finish P0-3 in packages/db. Add Drizzle tables: users, roles, role_permissions, user_outlets, devices, sessions, units, hsn_codes, items, item_prices, parties, ledgers, ledger_groups, bill_series, vouchers, voucher_items, stock_moves, ledger_entries, payments, outbox, audit_log, activity_log, error_log, settings. Every table: id UUID v7, tenant_id, company_id (+ outlet_id where it belongs), created_at, updated_at. Money NUMERIC(14,2) in Postgres. Unique (company_id, fin_year, series, bill_no). Generate the migration, apply it with pnpm db:migrate, extend live tests. Also create the SQLite twin schema (money = integer paise) for the desktop app with a test that both schemas have the same tables and columns.
```

### 02 — Voucher engine
```
Read AGENTS.md, docs/DECISIONS.md, docs/ARCHITECTURE.md, docs/PROGRESS.md. Follow the task workflow.
Task: P0-4 voucher engine in packages/core: postSale, postPurchase, postReturn, postReceipt, postPayment, cancelVoucher. One DB transaction writes voucher + items + stock_moves + balanced ledger_entries + next bill number (taken inside the transaction) + outbox row + audit_log. Idempotent by voucher id (posting the same id twice creates one bill). Cancel never deletes: status=cancelled + reason + reverse entries. Use money helpers from packages/core. Design the engine against a small repository interface so it runs on both Postgres and SQLite.
```

### 03 — Voucher engine tests
```
Read AGENTS.md and docs/PROGRESS.md. Follow the task workflow.
Task: P0-5 tests for the voucher engine: sale, purchase, return, cancel, partial payment, discount, round-off, intra-state CGST+SGST, inter-state IGST, 0%/5%/12%/18%/28% slabs, same bill posted twice → one bill, error thrown mid-transaction → nothing saved, debit = credit in every case, stock after sale+return+cancel is correct. Run on SQLite in-memory and on Neon (live, rolled back).
```

### 04 — Error log system
```
Read AGENTS.md, docs/DECISIONS.md (#23, #28). Follow the task workflow.
Task: P0-6 error system in packages/core/errors: AppError with code, simple English "What happened / Why / How to fix" texts in packages/ui/i18n/en.json, saved to error_log table, Sentry hook (DSN from env, off if empty), no customer names or amounts in logs. Tests for every error code.
```

### 05 — UI base kit
```
Read AGENTS.md, docs/DECISIONS.md (#22, #28). Follow the task workflow.
Task: P0-7 packages/ui with React + Vite: design tokens (accent #1E40AF, Inter), Button, Input, NumberInput (₹), Select, Table, Modal, Toast, TopBar (logo + business name slot + WhatsApp status dot), keyboard shortcut manager (Alt+G go-to, F1 help list), i18n with en.json only. A demo page showing every component. All text simple English.
```

### 06 — Phase 0 gate
```
Read AGENTS.md, docs/PROGRESS.md and docs/MASTER_PLAN.md Step 4. Check the Phase 0 gate: CI green, voucher engine tests pass, debit = credit everywhere, duplicate post creates one bill, migrations apply cleanly on a fresh Neon branch (create one with the neon CLI, test, delete it). Report PASS/FAIL with reasons and missing tasks. Do not start Phase 1. Update PROGRESS.md current phase only if PASS.
```

---

## PHASE 1 — Offline billing desktop + installer

### 07 — Desktop shell + installer
```
Read AGENTS.md, docs/DECISIONS.md (#15, #16, #29). Follow the task workflow.
Task: apps/desktop with Tauri 2 + React (packages/ui). Local SQLite via the SQLite twin schema: journal_mode=WAL, synchronous=FULL, PRAGMA quick_check on start. Owner login + staff PIN with 10-minute auto lock. GitHub Actions builds Windows EXE (NSIS) and MSI on tag push. Tauri signed updater wired (keys from secrets), update popup "New update available" with [Update now] [Update tonight], never during an open bill.
```

### 08 — Setup wizard + branding
```
Read AGENTS.md, docs/DECISIONS.md (#20, #27, #28). Follow the task workflow.
Task: 10-step setup wizard in apps/desktop (and reusable for web): activate, business type, business details + logo upload, outlets/counters, printer, tax + bill design with live preview, import, users, backup/WhatsApp (skippable), test bill. Resume where left. Logo + business name in top bar, login screen, bills, reports, PDFs.
```

### 09 — Masters
```
Read AGENTS.md. Follow the task workflow.
Task: masters screens (keyboard-first): items (barcode, HSN, GST rate, units, MRP, sale/purchase rate), units, parties (customers/suppliers, GSTIN, state, credit limit), ledgers and groups, godowns. Search, add, edit, deactivate (never delete if used). Tests for validation rules (GSTIN format, state code).
```

### 10 — Billing screen
```
Read AGENTS.md, docs/DECISIONS.md (#22). Follow the task workflow.
Task: billing screen that works fully without a mouse: F3 item search, barcode input, qty/rate/discount, cash/UPI/credit/split payment, Ctrl+S save, Ctrl+P print, Esc back, Alt+G go-to, F1 shortcut list. Bill id created when screen opens (idempotency). Draft autosave every 3 s and "Restore unfinished bill" after restart. Save uses the voucher engine. Playwright test: make 50 bills using keyboard only.
```

### 11 — Printer module
```
Read AGENTS.md, docs/DECISIONS.md (#21). Follow the task workflow.
Task: printer module: detect Windows printers, USB, LAN (port 9100 scan), Bluetooth. ESC/POS for 58/80 mm thermal, HTML→PDF for A4/A5. Map Bill/KOT/Invoice/Label to printers per counter; client can change and save any time. Print queue with status, errors in simple English (Paper finished, Printer is off, Cover is open), Retry, Reprint, Clear stuck queue (also Windows spooler), backup printer, Save as PDF. Bill is saved before printing.
```

### 12 — Bulk upload
```
Read AGENTS.md, docs/DECISIONS.md (#26). Follow the task workflow.
Task: Excel/CSV bulk upload with downloadable templates for items, menu, opening stock, parties, staff, tables, rooms, price lists. Preview with "rows with errors" + reason before saving. Starter lists: common grocery items and a sample restaurant menu. Tests with good and bad files.
```

### 13 — Purchase, stock, cancel register
```
Read AGENTS.md. Follow the task workflow.
Task: purchase entry, purchase return, stock balance, low stock alert, godown transfer, cancel register (with reason), edit history of every voucher. All stock numbers come only from stock_moves.
```

### 14 — Backup + power-cut safety
```
Read AGENTS.md, docs/STORAGE.md, AGENTS.md rule 15. Follow the task workflow.
Task: local backup .erpbak (weekly full + daily incremental, zstd + AES, manifest.json), restore with integrity check. Power-cut tests: kill the app during typing, during save, during print, during sync; 1000-bill run; prove no lost and no duplicate bill.
```

### 15 — Phase 1 gate
```
Read AGENTS.md, docs/PROGRESS.md, docs/MASTER_PLAN.md Step 4. Check Phase 1 gate: 1000 bills, power-cut tests, installer install + update, keyboard-only billing, printer flow with a PDF fallback. Report PASS/FAIL. Do not start Phase 2.
```

---

## PHASE 2 — Accounts, GST, reports

### 16 — Accounts
```
Read AGENTS.md. Follow the task workflow.
Task: receipts, payments, journal, contra, party ledger, credit (udhaar) ageing, day book, cash book, bank book, trial balance, P&L, balance sheet. All read from ledger_entries only. Tests that trial balance always tallies.
```

### 17 — GST
```
Read AGENTS.md. Follow the task workflow. Mark any unclear GST rule as TODO(owner) instead of guessing.
Task: GST engine: CGST/SGST/IGST by state code, HSN summary, GSTR-1 JSON (B2B, B2C large, B2C small, credit notes, HSN), GSTR-3B summary, period lock after filing.
```

### 18 — Reports (70+)
```
Read AGENTS.md. Follow the task workflow.
Task: reports framework (filters, date range, outlet filter, export Excel/PDF, print) and the full report list from docs/ARCHITECTURE.md / docs/COMPETITORS.md. Every report reads from entries. Snapshot tests for each report on a fixed demo dataset.
```

### 19 — CA export + nightly self-check
```
Read AGENTS.md. Follow the task workflow.
Task: Tally XML export and CA export pack (ledgers, vouchers, GST). Nightly self-check: books balance, stock = moves, cash = cash ledger, GST = invoice tax; alert owner on mismatch.
```

---

## PHASE 3 — Cloud, website, Super Admin, licence

### 20 — API + login + privacy
```
Read AGENTS.md, docs/DECISIONS.md (#12, #13). Follow the task workflow.
Task: apps/api with Hono (runs on Node and Cloudflare). Login ID + password, stay logged in (refresh token), 5 wrong tries → 15 min lock, devices list + remote logout, new-device alert. tenant_id only from the token. Postgres Row Level Security on every table. Automated test: shop A can never read shop B.
```

### 21 — Sync
```
Read AGENTS.md. Follow the task workflow.
Task: packages/sync: outbox push/pull, Idempotency-Key, batches, retry with backoff, resume after restart, LAN hub mode for multi-counter shops. Test: 3 devices × 1000 bills offline then sync → zero duplicates, zero missing.
```

### 22 — Web app
```
Read AGENTS.md, docs/DECISIONS.md (#15, #19). Follow the task workflow.
Task: apps/web (React PWA): login, shop/outlet picker, billing with W- series, "PC offline, last sync <time>" banner, reports, multi-outlet (company → outlet), "Add to room" ready for HoReCa.
```

### 23 — Super Admin
```
Read AGENTS.md, docs/DECISIONS.md (#13, #17, #27). Follow the task workflow.
Task: apps/admin: create client (Client ID + owner Login ID + temporary password), plans, modules on/off, limits, suspend, usage counts only (never amounts or customer names), Login ID view, temporary password (24 h, single use, forced change), support mode with owner approval, app versions, WhatsApp status, error dashboard. Super Admin login = password + authenticator app.
```

### 24 — Licence + payments + logs + releases
```
Read AGENTS.md, docs/DECISIONS.md (#16, #25). Follow the task workflow.
Task: packages/licence (Ed25519 tokens, device binding, 7-day check, clock guard, grace → read-only, offline device code). Razorpay Subscriptions + GST invoice. Activity log (screens 7 days, clicks 3 days) + permanent money audit + owner viewer. Release system: staging, 5% ring, feature flags, API versioning, rollback. Google Drive backup upload.
```

### 25 — Phase 3 gate
```
Read AGENTS.md, docs/PROGRESS.md, docs/MASTER_PLAN.md Step 4. Check Phase 3 gate: 3 devices × 1000 bills zero duplicates, restore test, RLS isolation test, licence expiry test. Report PASS/FAIL. Then write the pilot checklist for Phase 4.
```

---

## PHASE 4 — Pilot (only bug fixes)
```
Read AGENTS.md. Bug from pilot shop: <what happened, screen, steps, time>. Write a failing test first, then fix, then PR. No new features.
```

---

## PHASE 5 — WhatsApp, SMS, QR, AI

### 26 — WhatsApp
```
Read AGENTS.md, docs/DECISIONS.md (#17). Follow the task workflow.
Task: apps/whatsapp with @whiskeysockets/baileys only (never look-alike packages): payment receipt to customer, daybook to owner at set time, nothing else. Queue + retry + rate limit, SMS fallback. Status green/yellow/red + reconnect by QR, 30-min alert.
```

### 27 — SMS + OTP
```
Read AGENTS.md, docs/DECISIONS.md (#12). Follow the task workflow.
Task: MSG91 SMS (DLT templates), OTP order: WhatsApp authentication template → SMS → email (Resend). OTP only for password reset, Super Admin and optional 2-step.
```

### 28 — Shop QR + attendance
```
Read AGENTS.md, docs/DECISIONS.md (#14). Follow the task workflow.
Task: apps/shop-page QR order page + direct UPI + owner notification, with all misuse protections in #14. Staff attendance with 30-second rotating QR, device binding, GPS, Doubtful flag. Reward points.
```

### 29 — AI helper
```
Read AGENTS.md, docs/DECISIONS.md (#24). Follow the task workflow.
Task: AI helper with Gemini: model returns only an intent (screen/report + filters), the app runs the report itself. Never send client business data on the free tier. Daily limit per client. Offline → normal menu + F1 help.
```

---

## PHASE 6 — Packs + Android

### 30 — Plugin SDK + packs
```
Read AGENTS.md, docs/ARCHITECTURE.md. Follow the task workflow.
Task: finalise packages/plugin-sdk (hooks, attributes JSONB fields, UI slots). Then build packs one PR each: wholesale, pharma (batch, expiry, Schedule H), garment (size-colour matrix).
```

### 31 — HoReCa One pack
```
Read AGENTS.md, docs/DECISIONS.md (#18, #19). Follow the task workflow.
Task: HoReCa pack: tables, KOT, kitchen printer, table QR with modes A/B/C, waiter role, outlets Rooms/Restaurant/Bar/Cafe with own series and tax, "Add to room" folio, stock transfer store → bar/kitchen.
```

### 32 — Android + integrations
```
Read AGENTS.md. First add a DECISIONS.md entry choosing Tauri mobile or Capacitor with reasons. Then build the Android app (owner dashboard, billing, reports). Then integrations hub: UrbanPiper (Zomato/Swiggy) and a hotel channel manager.
```

---

## Har waqt kaam aane wale prompt

**Status check**
```
Read docs/PROGRESS.md and the Handoff Log. Tell me in 5 lines: done, in progress, blocked, next prompt number, any question for the owner.
```

**Review a PR**
```
Read AGENTS.md. Review PR #<number> for golden-rule breaks, money/stock/GST correctness, tenant isolation and missing tests. List must-fix and nice-to-have. Fix the must-fix items on the same branch.
```

**Fix a bug**
```
Read AGENTS.md. Bug: <what happened, which screen, steps>. Write a failing test first, then fix, then PR.
```
