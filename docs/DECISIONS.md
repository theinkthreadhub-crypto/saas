# DECISIONS — the decision log

Rule: never silently change a decision. Add a new entry that replaces the old one (mark old as "Superseded by #N").
Format: `## #N — Title (date, agent/owner)` → Decision · Why · Alternatives rejected.

## #1 — One codebase: Core + Packs + Templates (2026-11-27, owner)
Decision: single ERP for all business types; industry features as plugin packs.
Why: avoid building many ERPs; faster to add new industries.

## #2 — Offline-first with local SQLite (2026-11-27, owner)
Decision: billing always writes to local SQLite first; cloud sync in background.
Why: small-town internet is unreliable; billing must never stop.

## #3 — Cloud DB = PostgreSQL on Neon (2026-11-27, owner)
Why: ACID, JSONB for packs, Row Level Security, free start (100 projects × 1 GB), standard Postgres = easy exit.
Rejected: Firebase (per-read cost, no joins), MongoDB (weak for accounting), Cloudflare D1 (10 GB cap, single-threaded),
Oracle Free (no free backup, licence cost later), Supabase free (pauses after 1 week inactivity; Pro is a fine alternative).

## #4 — Backend = Hono, on Cloudflare Workers first, Docker/VPS later (2026-11-27, owner)
Why: near-zero cost to start; Hono runs on both Workers and Node so moving needs no rewrite.
Rejected: NestJS (heavier, not Workers-friendly), Vercel (Hobby plan is non-commercial only).

## #5 — Hosting & storage = Cloudflare (Pages, R2, DNS, WAF) (2026-11-27, owner)
Why: free tiers allow commercial use; R2 has no egress fees (free restores).

## #6 — WhatsApp via Baileys, receipts + daybook only (2026-11-27, owner)
Why: official API approval is slow. Risk: number ban (unofficial, against WhatsApp ToS).
Mitigation: transactional only, rate limits, sendMessage() abstraction to switch to official Cloud API.
Runs on a small always-on VPS (Workers cannot hold a WebSocket session long-term).

## #7 — No hard delete of vouchers (2026-11-27, owner)
Cancel with reason + reverse entries + owner alert + register.

## #8 — Subscription with signed licence token (2026-11-27, owner)
Online check every 7 days for desktop; expiry → grace → read-only; data never locked.
Offline-only plan via device-code activation.

## #9 — Shop customer payments = direct UPI, no gateway (2026-11-27, owner)
Why: zero fee. Razorpay only for SetuPro's own SaaS fees (platform fee applies on UPI there).

## #10 — Multi-AI development with AGENTS.md as single source (2026-11-27, owner)
Claude Code (via CLAUDE.md `@AGENTS.md` import), Google Antigravity and OpenAI Codex all read AGENTS.md.
Progress in docs/PROGRESS.md; decisions here.

## #12 — Simple login like Facebook/Instagram (2026-11-27, owner)
Decision: client login = Login ID (mobile or username) + password. Stay logged in on that device until logout
(long-lived refresh token). NO OTP on normal login, even on a new device.
OTP only for: password reset, Super Admin login, and if the owner turns on optional "Extra suraksha (2-step)".
Safety instead of OTP: new-device login alert to owner (info only), 5 wrong tries → 15 min lock,
min 8-char password (no 1234 / mobile number), "My devices" list + remote logout, counter staff PIN + 10-min auto lock.
OTP channel order (when needed): WhatsApp official authentication template → SMS (MSG91) → email (Resend free).
Never Baileys for OTP.

## #11 — Product name (OPEN)
Company: SetuPro (setupro.in). Sister product: HoReCa One.
Shortlist: SePro One, ReDi One, ReMeGa One, Shop One. "Bill One" has a trademark risk (existing Sansan "Bill One" invoice SaaS).
Owner to decide after trademark + domain + Play Store checks.

## #13 — Super Admin: see Login ID + temporary password reset (2026-11-27, owner)
Decision: Super Admin client page shows each user's Login ID (mobile/username), role, status, last login.
Password is NEVER visible to anyone (stored as hash only).
Forgot ID → Super Admin tells the Login ID after calling back the shop's registered mobile.
Forgot password → Super Admin clicks "Temporary password banao" → one-time password (valid 24 hrs, single use).
Client logs in with it → app forces "Naya password banao" screen → old sessions logged out.
Safety: only the shop owner (or owner-approved user) can ask; callback check; alert to owner on WhatsApp/SMS;
every view/reset saved in audit log (who, when, which client). Super Admin login itself = password + authenticator.

## #14 — QR misuse protection (2026-11-27, owner asked)
Problem: someone photographs the shop QR and places fake orders from home; staff photographs attendance QR and marks from home.
Shop order QR:
- Order = "request" only. Stock is NOT reduced until shop clicks Accept. Unaccepted orders auto-cancel in 15 min.
- Owner chooses mode: (a) "Sirf dukan par" = phone location must be within ~100 m (browser GPS), else order blocked;
  (b) "Ghar se bhi" = home order allowed but needs mobile number check (WhatsApp/SMS tap or OTP) + advance UPI if owner wants.
- Limits: max 3 open orders per mobile/device, Cloudflare Turnstile (invisible captcha), rate limit per IP.
- Owner can mark "fake" → that mobile/device blocked. Repeat fake orders shown in report.
- Table/counter QR (hotel/cafe): QR carries table code; optional daily-changing 4-digit counter code.
Staff attendance QR:
- QR is dynamic: shown on owner/counter screen, changes every 30 sec (signed token with time). Printed photo stops working.
- Staff phone is bound to staff ID (1 device). GPS must be near the shop. Optional selfie.
- Every scan logs time, location, device. Owner sees "doubtful" flag if anything mismatches.

## #15 — Installer stays (2026-11-27, owner confirmed)
Decision: keep the original plan. One SaaS, three ways to use it, same login and same data:
1. Desktop installer (EXE/MSI, Tauri) — offline-first, local SQLite, syncs to cloud when net comes.
2. Website erp.setupro.in / PWA — when PC is off or client wants online only (bill series W-).
3. Offline-only installer — no internet; licence by device code; backup to pen drive/Google Drive when net is available.
Rejected: "online first, installer later". Installer is part of Phase 1, not postponed.

## #16 — How updates, bug fixes and shifts reach all clients (2026-11-27)
Release path (every change): test on staging → 5% clients (pilot ring) for 1–2 days → 100%. Rollback button always ready.
- Website/PWA: deploy once (Cloudflare) → all online users get it on next refresh. Instant rollback to previous version.
- Desktop installer: Tauri auto-updater (signed). App checks on start; downloads in background; installs on next app
  restart or at night — NEVER in the middle of billing. Owner sees "Naya update aaya" with what changed.
- Android app: Play Store staged rollout (5% → 100%) + in-app "update karo" prompt. Critical fix can force update.
- Old versions keep working: API is versioned (/v1, /v2); server supports at least 2 old app versions. Too-old app
  shows "Update zaroori hai" instead of breaking data.
- Database change: "expand → migrate → contract". First add new column/table (old app still works), move data,
  remove old thing only after all apps updated. Local SQLite migrations run on app start, inside a transaction, after
  an automatic backup.
- Big features ship hidden behind feature flags; turn on per client from Super Admin.
- Bug fix (hotfix): fix → test → web live in minutes, installer/APK within the day. Super Admin shows each client's app version.
- Database/provider shift (e.g. Neon → own Postgres VPS): full backup → copy data → keep both in sync → switch the
  API connection at night → watch → old one kept 7 days. Installers don't notice: they talk to our API, not the DB.
  Offline installers keep billing locally the whole time; outbox syncs after switch.
- Notice to clients only when needed (WhatsApp/in-app banner), e.g. "Raat 2–3 baje maintenance".
Update notice in installer (added 2026-11-27): small popup/banner "Naya update aaya (v1.x)" + 2–3 line "kya naya hai"
in simple English + buttons [Update now] [Update tonight]. Never shown while a bill is open; shown on dashboard/after bill save.
Critical fix = red banner, update on next restart. Super Admin can also push a message/announcement to all or selected clients.

## #17 — WhatsApp status icon on dashboard (2026-11-27, owner)
Small WhatsApp icon in the top bar of installer, web and app:
- Green = connected. Yellow = connecting. Red = disconnected / logged out.
- Tap icon → shows status + "Dobara connect karo" (scan QR from owner's phone) + last message sent time.
- While red: receipts/daybook wait in a queue and are sent automatically after reconnect (nothing lost).
- If red for > 30 min: alert banner on dashboard + notice to owner. Super Admin sees every client's WhatsApp status.

## #18 — Hotel/restaurant table QR: no fake cooking (2026-11-27, owner)
Rule: food is cooked only after a real person is confirmed. QR order never goes straight to kitchen on a "closed" table.
- Table session: table is "closed" until waiter/captain opens it in POS (or first QR order is confirmed by waiter at table).
  Order on a closed table = "Pending — waiter check" (shows on captain phone with table no.), NOT a KOT.
- After waiter confirms once, later add-on orders from same table go straight to kitchen (session open till bill paid).
- Session closes automatically when bill is settled → same QR photo cannot order again from home.
- Extra checks (owner can turn on): GPS within ~50 m; order allowed only on restaurant Wi-Fi (public IP match);
  table QR carries a token that changes each session (printed QR stays same, link checks session).
- Takeaway/home delivery via QR: separate mode — UPI advance first, KOT only after payment received.
- Limits + Turnstile + "Fake" block list same as #14. Report: pending orders rejected, per table/day.
Update to #18 (2026-11-27, owner): goal = waiter work should be minimum. Owner picks one mode in Settings:
- Mode A "Pehle payment" (default, zero waiter): customer pays UPI from QR page → payment received → KOT auto to kitchen.
- Mode B "Smart auto": no payment first; KOT auto only if phone is on restaurant Wi-Fi or within ~50 m GPS.
  If check fails → order goes to captain for one tap confirm. Orders above owner-set amount (e.g. ₹1000) also need one tap.
- Mode C "Waiter confirm": every first order of a table confirmed by waiter (for busy dine-in only).
Waiter role exists in User Master with small rights: see tables, confirm/punch KOT, call bill. No cancel, no discount,
no reports (owner can change).

## #19 — Multiple businesses / multiple outlets (2026-11-27, owner)
Structure: Account (owner login) → Company (own GSTIN, own books) → Outlet (billing unit) → Counter/device.
Case 1 — one owner, many businesses/branches (hotel in Orai + cafe in Jhansi + kirana):
- One login, "dukaan chuno" picker, owner dashboard shows all together + each separately.
- Each company/outlet has own stock, bill series, GST, reports. Subscription priced per outlet.
Case 2 — one hotel with Rooms + Restaurant + Bar + Cafe (separate billing):
- Each is an Outlet under same company: own bill series (H-, R-, B-, C-), own menu/items, own stock,
  own KOT printer, own counter staff, own tax rules (room/food GST; bar liquor outside GST → state VAT setting).
- "Room mein jodo" (post to room): restaurant/bar/cafe bill of a staying guest is added to room folio,
  paid at checkout in one final bill; each outlet still gets its own sale in reports.
- Shared guest/customer master; stock transfer between outlets (store → bar/kitchen) with entry.
- Staff permission per outlet (bar staff sees only bar). Reports: per outlet + combined; day close per outlet.
Data: every row has tenant_id + company_id + outlet_id. Privacy rule same as before.

## #20 — First-time setup wizard (2026-11-27, owner)
Steps (can be done by SetuPro team at install, or by client; resume anytime):
1 Activate (login or licence key) → 2 Business type → 3 Business details: name, LOGO upload, address, GSTIN, phone, UPI ID
→ 4 Outlets + counters → 5 Printer detect + test print → 6 Tax + bill design (live preview with logo/name)
→ 7 Import items/opening stock/parties (Excel template) → 8 Users + roles → 9 Backup (Google Drive) + WhatsApp connect (optional)
→ 10 Make one test bill → "Taiyaar!".
Branding: client logo + business name shown on app top bar, login screen, every bill/KOT/report/PDF/WhatsApp receipt.

## #21 — Printer module
- Auto-detect: all Windows-installed printers + USB + LAN (port 9100 scan) + Bluetooth. Types: thermal 58/80 mm (ESC/POS),
  A4/A5, dot-matrix, label/barcode. Paper width auto-suggested; test print button.
- Mapping per outlet/counter: Bill → counter thermal, KOT → kitchen printer, Invoice → A4, Label → label printer.
- No hard rule: client can change printer any time and save it (anyone with Settings permission). Saved per device;
  survives updates and restarts.
- Print queue: every job saved with status. Errors in simple English ("Paper finished", "Printer is off", "Cover is open").
  Buttons: Retry, Reprint, "Atki queue saaf karo" (also clears Windows spooler), use backup printer, Save as PDF.
  Bill is saved first, print is separate → printer failure never loses a bill.

## #22 — Full keyboard billing (Tally-like)
Whole billing without mouse. Alt+G = "Kahan jaana hai" search (like Tally Go To). Examples: Alt+B new bill, Alt+P purchase,
Alt+R receipt, Alt+D daybook, F3 item search, Enter = next field, Ctrl+S save, Ctrl+P print, Esc back, F1 help, F12 settings.
Shortcut list on screen (F1). Same in installer and web.

## #23 — Error log (easy to solve)
Every error saved: code, simple English message, screen, what user was doing, likely reason, fix steps, time, app version, device.
Client sees "Kya hua / Kyun hua / Kaise theek karein" + "Report bhejo". Super Admin: error dashboard grouped by code + how many
clients hit it. Tech side: Sentry. No customer names/amounts in error logs.

## #24 — AI helper (Gemini)
Free tier note: Google may use free-tier prompts to improve products and human reviewers may read them.
So: AI NEVER receives client business data on free tier.
How: user asks ("last year kitni sale", "top selling item", "printer badlo", "daybook kholo") → Gemini only returns an INTENT
(which report/screen + filters) → our app runs the report locally/on our server and shows the numbers. Help/guide questions
use our own help docs. Move to paid tier before sending any data for summaries. Daily limit per client. Works only online;
offline shows normal menu + F1 help.

## #25 — Activity log (7-day) + money audit (permanent)
- Name in app: "Activity log". Screen log (Home → Billing → Save → Print), user, time, device: kept 7 days.
  Click log (every button/mouse click): kept 3 days. No raw mouse movement. ~1–2 MB per shop. Owner can view/filter.
- Money audit: create/edit/cancel bill, discount, price change, stock adjust, delete attempt, permission change, backup restore.
  NEVER auto-deleted (needed for CA/GST and fraud check). Cannot be edited by anyone.

## #26 — Bulk upload (2026-11-27, owner)
Excel/CSV templates (download → fill → upload) for: items/products, restaurant menu, opening stock, parties (customers/
suppliers), staff, tables, rooms, rates/price lists. Upload shows preview + "galat rows" list with reason before saving.
Ready-made starter lists per business type (common grocery items, sample menu) — client edits after.
SetuPro team can bulk upload from Super Admin during setup (support mode, see #27).

## #27 — Super Admin control + how a client is set up connected to cloud
Super Admin can control every client: create, activate, suspend/block, extend/expire plan, turn modules on/off
(QR, WhatsApp, AI, packs), set limits (users, outlets, devices), force update, push message, reset password (#13),
see status (version, last sync, WhatsApp, errors). Privacy: Super Admin sees counts, not bills.
Support mode: to set up or fix inside client data, client owner approves → time-limited access (e.g. 2 hours), every
action in activity log + money audit, owner gets alert.
Client setup flow (always cloud-connected):
1. Super Admin → "Naya client" → business type, plan → system creates Client ID + owner Login ID + temporary password.
2. Team does setup from office in Support mode on the web (cloud): logo, name, printer defaults, bulk upload items/menu, users.
3. At shop: install installer → owner logs in once with Login ID → PC registers as a device of that client →
   all setup + items download from cloud automatically → printer detect → test bill.
4. From then on: bills save on PC first, sync to cloud; same data on web/app. Offline-only clients: licence by device code,
   setup via file (.erpsetup) and backup by pen drive/Drive.

## #28 — Whole SaaS in English (2026-11-27, owner)
Decision: every screen, button, bill, KOT, report, error, popup, WhatsApp/SMS text, help and AI answers in simple English.
Earlier Hinglish labels in decisions/designs are examples only — final UI text is English
(e.g. "Restore unfinished bill", "Update now", "Reconnect WhatsApp", "Waiter check", "Add to room", "Clear stuck queue").
i18n keys kept so Hindi can be added later if needed. Docs for owner (PEHLE_PADHO.md) may stay Hinglish.

## #29 — Windows installer format (2026-11-27)
Main: **EXE (NSIS, Tauri)** for shops — small, simple, no admin needed, works with Tauri auto-updater.
Also build **MSI (WiX, Tauri)** for big clients whose IT installs on many PCs. Both from the same CI build.
Not MSIX: Tauri does not build it, needs a mandatory signing certificate, and its sandbox can block printers/USB/local DB.
Buy a code-signing certificate before pilot so Windows does not show "Unknown publisher" warning.
