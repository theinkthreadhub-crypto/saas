# MASTER PLAN — kaam shuru se launch tak (owner ke liye)

Is plan ka ek hi maksad hai: **kaam shuru hone ke baad kuch bhoola ya chhoota na jaaye.**
Sabse bada niyam: **koi bhi baat sirf chat ya dimaag mein mat rakho. Sab is repo ki files mein likho.**
AI ko pichhli baat-cheet yaad nahi rehti; files yaad rehti hain.

---

## Step 0 — Kaam shuru karne se pehle (1 hafta)

### Accounts (sab apne naam + business email se)
- [ ] Business email: `owner@setupro.in`, `support@setupro.in`
- [ ] GitHub account + private repo `setupro-erp` (is kit ko root mein daalo)
- [ ] Cloudflare account (setupro.in ka DNS yahan laao; Pages, R2, Workers)
- [ ] Neon account (database)
- [ ] Password manager (Bitwarden) — saare passwords ek jagah, developer ko sirf zaroori access
- [ ] Baad mein: DigitalOcean (WhatsApp service), Razorpay, MSG91 + DLT, Sentry, UptimeRobot, Google Play

### Faisle
- [ ] Product ka naam final (DECISIONS.md #11) + domain + trademark check
- [ ] Pehle 2 business: kirana + wholesale (DECISIONS.md mein likha hai)
- [ ] Price ka andaaza (monthly / yearly / offline lifetime + AMC)

### Log aur saamaan
- [ ] Ek developer (junior/mid, TypeScript/React aata ho) — AI ka likha code chalayega, test karega, deploy karega
- [ ] Ek CA jo GST aur accounts reports check karega
- [ ] 3–5 pilot dukaanein (Orai): kirana + wholesale, jo ek mahina saath chalane ko taiyaar hon
- [ ] Testing saamaan: thermal printer (58/80 mm), barcode scanner, purana Windows PC (4 GB RAM), sasta Android phone

---

## Step 1 — Teen AI ka kaam kaise baantein (takraav na ho)

| AI | Kya karega |
|---|---|
| **Claude** | Core logic (bill, stock, ledger, GST), database design, sync, code review |
| **Antigravity** | Screens/UI: desktop app, web app, Super Admin, QR page |
| **Codex** | Tests, API endpoints, bug fix, refactor |

- Ek waqt mein **ek AI = ek task**. Do AI ko same file/area kabhi saath mat do.
- Har AI apni **branch** par kaam kare, PR banaye. Developer PR check karke `main` mein jode.
- Kaam dene ka message hamesha yahi:
  > "AGENTS.md aur docs/PROGRESS.md padho. Task: <task ka naam>. Claim karo, poora karo, tests chalao, PROGRESS.md aur Handoff Log update karo."

---

## Step 2 — Har task ka 10-step tareeka (kabhi skip nahi)
1. PROGRESS.md mein task chuno
2. AI ko task do (upar wala message)
3. AI task ko `[~]` claim kare
4. AI code + tests likhe
5. Saare tests pass (`pnpm test`)
6. AI PROGRESS.md mein `[x]` + Handoff Log likhe
7. Naya faisla hua to DECISIONS.md mein entry
8. Developer PR khole, khud chala kar dekhe
9. Ek **doosra AI** code review kare ("Is PR ko review karo, AGENTS.md ke niyam check karo")
10. Merge → agla task

---

## Step 3 — Rozana aur hafte ka routine

### Roz (15 minute, owner)
- PROGRESS.md ka Handoff Log padho: kal kya hua
- "Questions for owner" ke jawab do
- Developer se 1 line: kya chal raha, koi rukawat?

### Har hafte (1 ghanta)
- Demo dekho: is hafte jo bana, khud chala kar dekho
- Agle hafte ke 5–10 tasks tay karo
- DECISIONS.md padho: kuch galat to nahi likha gaya
- GitHub par backup: repo ka zip apne Google Drive mein

---

## Step 4 — Phase aur gate (gate paas kiye bina aage nahi)

| Phase | Kaam | Samay (AI + 1 dev) | Gate (paas hona zaroori) |
|---|---|---|---|
| 0 | Foundation | 1–2 hafte | CI chalu, voucher engine ke tests pass |
| 1 | Offline billing desktop | 3–4 hafte | 1000 bills, power-cut test, koi bill nahi khoya |
| 2 | Accounts, GST, reports | 3–4 hafte | CA ne ek sample mahina check kiya, trial balance tally |
| 3 | Cloud, sync, Super Admin, licence | 4–6 hafte | 3 device × 1000 bills, duplicate zero, restore test pass |
| 4 | Pilot (3–5 dukaan) | 4 hafte | 30 din zero mismatch, dukaandaar khush |
| 5 | WhatsApp, SMS, QR | 3–4 hafte | Receipt + daybook 2 hafte bina ban ke |
| 6 | Packs (wholesale, pharma, garment, HoReCa) | 6–8 hafte | Har pack ka 1 pilot client |

---

## Step 5 — "Bhoolna nahi" checklists

### Har release se pehle
- [ ] Saare tests pass (unit + E2E)
- [ ] Power-cut test (typing / save / print / sync ke beech)
- [ ] Purane version se naye par update test (data safe?)
- [ ] Backup → restore test
- [ ] Changelog likha (kya naya, kya theek hua)

### Pilot se pehle
- [ ] Client ka purana data import test
- [ ] Printer, barcode, scale chal rahe
- [ ] Client ko 1 ghante ki training + Hindi help video
- [ ] Backup roz ho raha (Super Admin mein dikhe)
- [ ] Support number dukaan par chipka

### Launch se pehle
- [ ] Product naam + trademark apply
- [ ] Terms, privacy policy, refund policy (website par)
- [ ] Razorpay live, GST invoice client ko
- [ ] Code signing certificate (Windows warning na aaye)
- [ ] Sentry + UptimeRobot alerts aapke phone par

---

## Step 6 — Jab kuch gadbad ho
| Problem | Kya karein |
|---|---|
| AI ne kuch tod diya | PR merge mat karo; doosre AI se "is PR ki galti dhoondho" |
| Do AI ka kaam takraaya | Developer ek branch rakhe, doosra band; PROGRESS.md theek karo |
| AI purana faisla bhool gaya | DECISIONS.md ka entry number dikhao: "DECISIONS #3 padho" |
| Client ka bill galat | Self-check alert dekho, audit log se kisne kya kiya, test case likhwao taaki dobara na ho |
| Server band | UptimeRobot alert → developer; billing offline chalti rahegi, ghabrana nahi |

---

## Step 7 — Sab kuch kahan rahega (yaad rakhne ka system)
| Cheez | Jagah |
|---|---|
| Code | GitHub private repo |
| Niyam | AGENTS.md |
| Kya bana, kya baaki | docs/PROGRESS.md |
| Faisle | docs/DECISIONS.md |
| Passwords | Password manager (repo mein kabhi nahi) |
| Client list, plans | Super Admin |
| Repo ka backup | Har hafte Google Drive |

**Ek line mein:** har kaam file mein likho, har task 10-step se karo, har phase ka gate paas karo — tab kuch nahi chhootega.
