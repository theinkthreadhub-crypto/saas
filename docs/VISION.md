# VISION — SetuPro ERP

Owner company: **SetuPro** (setupro.in), Orai, Uttar Pradesh, India.
Product name: **TBD** (see DECISIONS.md). Sister product: **HoReCa One** (hotel/restaurant/cafe).

## The problem
Small Indian businesses use old, hard software (Tally, Marg, Busy) or simple apps that are weak in
accounting (Vyapar, myBillBook). Every industry needs a different software. Support in small towns is poor.

## Our answer
**One software for every business**, as easy as Vyapar and as solid as Tally/Marg,
in **very simple English**, working **offline and online**, with **local on-site setup and support**.

## Who uses it
| User | Uses | Main need |
|---|---|---|
| Cashier / counter staff | Desktop app | Very fast billing, barcode, print |
| Owner | Mobile + web | Daybook, sale, profit, udhaar, alerts, staff attendance |
| Salesman | Mobile | Order booking, collection |
| Accountant / CA | Web (read-only login) | GST reports, Tally export, ledgers |
| Customer of the shop | Phone browser (QR) | See stock, place order, see reward points |
| SetuPro team | Super Admin | Clients, plans, licences, updates, backups, support |

## Business types (packs)
- **Phase 1:** Kirana / grocery / general store · Wholesale / distributor
- **Phase 2:** Pharmacy / medical store · Pharma distributor · Garment / footwear
- **Phase 3:** Hotel/restaurant/cafe (HoReCa One) · School/coaching · Mobile/electronics · Hardware/paint ·
  Jewellery · Bakery/sweets · Stationery/books · Cosmetics · Auto parts/garage · Agri (khaad-beej) ·
  Small manufacturing (BOM, batch production)

## Must-have product features
1. **Core:** billing/POS, purchase, inventory (batch, expiry, multi-godown), double-entry accounting, GST
   (e-invoice, e-way bill, GSTR-1/3B), 70+ reports, users & roles, audit log.
2. **First-time setup wizard** by business type (template applies packs, settings, ledgers, bill format).
3. **Customization:** settings → designer (custom fields, bill print design) → client-only pack.
4. **Offline + online:** local SQLite billing; background sync to cloud; LAN hub for multi-counter shops.
5. **Multi-counter safety:** no stuck bills, no duplicate IDs/numbers, double-click safe (idempotency).
6. **Accuracy:** one transaction per action; reports from ledger only; cancel = automatic reverse entries;
   nightly self-check (trial balance, stock, cash, GST, sync totals) with alerts.
7. **Never delete bills:** cancel with reason + owner alert + permanent register + edit history.
8. **Backup:** client PC + cloud + R2 + SetuPro Google Drive; small, compressed, encrypted (see STORAGE.md).
9. **Super Admin:** clients, plans, licence, modules on/off, updates, backup monitor, health, support.
10. **Subscription:** monthly/yearly, Razorpay autopay or manual; 14-day trial; signed licence token works
    offline; online check every 7 days; on expiry → 7-day grace → **read-only** (data never locked).
11. **Offline-only plan:** device code → licence key activation, yearly or lifetime + AMC, pendrive backup.
12. **Login recovery:** OTP (WhatsApp then SMS), owner resets staff, SetuPro support reset with ID check;
    offline PIN on desktop.
13. **WhatsApp (Baileys):** ONLY (a) payment receipt to customer, (b) daybook to owner at a set time.
14. **SMS (MSG91 + DLT):** OTP and fallback receipt.
15. **QR module (client creates & prints from own app):** shop QR order page (live stock → order →
    notification → pack → pay cash/UPI direct, no gateway), staff attendance (rotating QR + GPS + selfie),
    customer reward points, item QR, bill QR, feedback QR.
16. **CA support:** accountant login, Tally XML export, GSTR-1 JSON, Excel/PDF, monthly auto email.
17. **Integrations hub (later):** hotel channel manager (AxisRooms/eZee), Zomato/Swiggy via UrbanPiper.

## Non-goals (for now)
- No marketing/bulk WhatsApp messages.
- No payment gateway for shop customers (direct UPI only). Razorpay only for our own SaaS fees.
- No microservices. One API + one WhatsApp service.

## Success = first 10 paying clients in Orai/Jalaun with zero bill mismatch for 30 days.
