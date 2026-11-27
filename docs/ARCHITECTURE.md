# ARCHITECTURE — simple and clean

Principle: **few moving parts, one language (TypeScript), portable everywhere.**

## 1. The whole system on one page

```
                         ┌───────────────────────────────┐
                         │  Super Admin (apps/admin)      │  SetuPro team
                         └──────────────┬────────────────┘
                                        │ HTTPS
┌──────────────────┐   sync   ┌─────────▼──────────────────────┐   ┌──────────────┐
│ Desktop app      │◄────────►│  API (apps/api, Hono)           │──►│ Neon Postgres│
│ (Tauri + SQLite) │          │  Cloudflare Workers (now)       │   └──────────────┘
│ offline billing  │          │  Docker on VPS (later, same code)│──►┌──────────────┐
└──────────────────┘          │  - auth, licence, sync           │   │ Cloudflare R2│
┌──────────────────┐  HTTPS   │  - reports, QR orders            │   │ files/backup │
│ Web/PWA (apps/web)│◄───────►│  - cron jobs: backup, daybook,   │   └──────────────┘
│ owner, staff, CA  │          │    self-check, reminders         │──►  Google Drive (backup copy)
└──────────────────┘          └───────┬───────────┬─────────────┘
┌──────────────────┐                  │ queue      │ webhooks
│ Shop QR page      │◄────────────────┘           ▼
│ (apps/shop-page)  │                 ┌──────────────────────────┐
│ customers order   │                 │ WhatsApp service (Baileys)│ small VPS, always-on
└──────────────────┘                 │ receipts + daybook only   │
                                     └──────────────────────────┘
External: Razorpay (our SaaS fees) · MSG91 (SMS/OTP) · GSP (e-invoice) · UrbanPiper / channel manager (later)
```

## 2. Software layers (inside the code)

| Layer | What | Rule |
|---|---|---|
| **Core** (`packages/core`) | Billing, purchase, stock, ledger, GST, reports, users | Same for every client. Pure TypeScript, no UI, fully unit-tested |
| **Packs** (`packs/*`) | Industry extras (pharma, garment, wholesale...) | Use plugin-sdk only: hooks, `attributes` JSONB, UI slots, extra reports |
| **Templates** (`templates/*.json`) | Business-type presets | Which packs on, settings, default ledgers, bill format, menu |

### Pack manifest example
```json
{
  "id": "pharma", "version": "1.0.0", "requires": ["core>=1.0"],
  "fields": { "item": ["salt", "schedule"], "batch": ["mfg_date", "expiry"] },
  "hooks": ["sale.beforeSave", "stock.daily"],
  "reports": ["near-expiry", "schedule-h-register"],
  "menus": ["Expiry Report"]
}
```
Hooks run in try/catch with timeout. A failing pack must never stop billing.

## 3. Data model (essential tables)
`tenants, companies, users, roles, devices, licences,`
`items, item_batches, parties, ledgers, godowns,`
`vouchers (bill/receipt/payment/journal/return), voucher_items, ledger_entries, stock_moves,`
`stock_balance, daily_summary, outbox, audit_log, company_packs, settings,`
`qr_orders, attendance, reward_points, notifications_log`

Rules: every table → `id UUID v7`, `tenant_id`, `company_id`, timestamps.
Money → `NUMERIC(14,2)` (Postgres) / integer paise (SQLite). Pack data → `attributes JSONB`.

## 4. Offline + sync
1. Action (e.g., sale) → ONE local transaction: voucher + items + stock_moves + ledger_entries + bill_no + outbox row.
2. Print happens **after** commit.
3. Sync worker every 5–10 min (or on demand): push outbox in batches of 100 with `Idempotency-Key`.
4. Server commits, returns ack → outbox row marked synced (kept 7 days, then purged).
5. Pull: masters (items, rates, settings) changed by other devices.
6. Conflicts: vouchers are append-only (no conflict). Masters → last-write-wins + audit log.
7. **LAN hub:** in multi-counter shops one PC runs the local API; other counters connect over LAN. Works without internet.

## 5. Multi-tenancy
- Default: **shared database** with `tenant_id` + Row Level Security.
- Big/premium clients: **own database** (Neon project). A `control` table maps tenant → database URL.
- Free stage (0–10 clients): one Neon project per client (each gets its own free quota).
- Migrations run on every database from one command.

## 6. Accuracy guarantees
- One transaction per action (all or nothing).
- Reports computed only from `ledger_entries` / `stock_moves`.
- Cancel/return = automatic reverse entries (stock, ledger, GST, party balance).
- GST per line (HSN, rate), CGST+SGST vs IGST by place of supply, round-off ledger.
- Period lock after GST filing; corrections via credit/debit note.
- **Nightly self-check** per company: debit = credit, stock = sum(stock_moves), cash book = cash ledger,
  GST report = sum of voucher taxes, local vs cloud bill count/total. Mismatch → alert owner + Super Admin.

## 7. Security
- Passwords hashed (argon2). Support can reset, never view.
- JWT sessions; OTP 5 min expiry; 5 tries → 15 min lock; reset alert to owner.
- Roles: owner, manager, cashier, accountant (read-only), salesman.
- Local DB + backups encrypted (SQLCipher / AES-256-GCM).
- All secrets server-side only (env / Wrangler secrets).
- Audit log for every change to vouchers, rates, settings, users.

## 8. Licence & subscription
- Payment (Razorpay or manual) → server issues **signed licence token** (Ed25519):
  `{tenant, plan, packs, devices, valid_till}`. App verifies with public key, offline.
- Online clients: check every login. Desktop: refresh when online; **must check at least every 7 days**.
- Clock tamper guard: app remembers latest seen time/last bill time.
- Expiry: reminders 7/3/1 days → 7-day grace → read-only (view/export allowed, no new bills).
- Offline-only plan: device code → licence key typed in; yearly or lifetime + AMC.

## 9. Background jobs (Cloudflare Cron/Queues/Workflows; later VPS cron)
| Job | When |
|---|---|
| Owner daybook (WhatsApp) | Owner-set time, per company |
| Backup to R2 + Google Drive | Nightly + incremental (see STORAGE.md) |
| Self-check of books | Nightly |
| Licence expiry reminders | Daily |
| Purge synced outbox / old logs | Daily |
| Archive old years to cold storage | Monthly |

## 10. QR module
- Client app → Settings → Shop QR → print. URL: `shop.<domain>/<shop-slug>`.
- Customer page: live stock (cached 1 min), cart, name+mobile, order. Pharma: block prescription drugs.
- Order → realtime notification to client app (sound) → staff marks ready → bill at counter.
- Payment: direct UPI intent/QR to shop's own UPI ID (`upi://pay?pa=..&am=..`), no gateway; staff marks paid.
- Attendance: rotating QR (changes every 30 s) on a shop device + staff phone scan + GPS radius + optional selfie.
- Rewards: points per ₹ spent (configurable), redeem as discount, customer views via QR.

## 11. WhatsApp service (apps/whatsapp)
- Node + `@whiskeysockets/baileys` (official repo only; never forks like "lotusbail").
- Each shop links its WhatsApp by QR. Sessions encrypted at rest.
- Sends ONLY: payment receipt (to the paying customer) and daybook (to owner). No marketing.
- Rate-limited, varied text, retries, fallback to SMS. Behind a `sendMessage()` interface so we can switch
  to the official WhatsApp Cloud API by config.

## 12. Environments & deployment
| Env | Where |
|---|---|
| local | `pnpm dev` (SQLite + local Postgres in Docker) |
| staging | Cloudflare (staging) + Neon branch |
| production | Cloudflare Workers/Pages + Neon + R2; WhatsApp service on DigitalOcean (Bangalore) |
CI: GitHub Actions → lint, typecheck, unit tests, E2E → deploy on merge to `main`.
Desktop updates: Tauri updater (signed) from `download.<domain>`.

## 13. Portability (exit plan)
Neon → any Postgres (`pg_dump`). Workers → Node/Docker (Hono runs both). R2 → S3/Backblaze (S3 API).
Pages → any static host. Change only env vars.
