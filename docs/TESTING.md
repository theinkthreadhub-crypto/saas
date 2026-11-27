# TESTING — how we prove it works

## 1. Tools (mostly free)
| Need | Tool | Cost |
|---|---|---|
| Unit tests (money, stock, GST, ledger) | **Vitest** | Free |
| Web/PWA/Super Admin end-to-end (click-through) | **Playwright** | Free |
| Desktop (Tauri) end-to-end | **Playwright + tauri-driver (WebDriver)** | Free |
| API tests | **Bruno** (or Postman) | Free |
| Load test (many shops syncing at once) | **k6** | Free (open source) |
| Run tests on every change | **GitHub Actions** | Free tier |
| Error tracking in real use | **Sentry** | Free tier |
| Uptime alerts | **UptimeRobot** | Free tier |
| Real Android phones/browsers | **BrowserStack** (paid) or 3–4 real cheap phones | Paid / one-time |
| Code quality | ESLint + TypeScript strict + Prettier | Free |

## 2. Must-pass business tests (before any release)
- Sale: cash, UPI, credit (udhaar), partial payment, discount (item + bill), round-off.
- Return, cancel, credit note, debit note → stock, ledger, GST all reversed exactly.
- GST: 0/5/12/18/28%, same-state (CGST+SGST) vs other-state (IGST), HSN summary matches bills.
- Multi-device: 3 devices × 1000 bills at the same time, Save pressed 5× each → no duplicates, no gaps, stock correct.
- Offline: create 500 bills offline, reconnect → all synced once, totals match.
- Power cut: kill app mid-save → either full bill or nothing.
- Licence: expiry → grace → read-only; clock moved back → blocked; offline 7+ days → asks for check.
- Backup: create → restore on a fresh PC → identical totals.
- Reports: trial balance tallies; P&L and balance sheet match a CA's manual calculation for a sample month.

## 3. Real-world testing
1. **Pilot:** 3–5 shops in Orai for 30 days (kirana + wholesale first).
2. **Parallel run:** shop uses old software (Tally/Marg) and ours together; compare daily totals.
3. **CA review:** one CA checks one full month's GST + accounts.
4. **Gate to launch:** 30 days with zero bill mismatch in nightly self-check.

## 4. Hardware to test
Thermal printer (58/80 mm), A4/A5 printer, barcode scanner, weighing scale, old Windows PC (4 GB RAM),
cheap Android phone, slow 3G/4G network.
