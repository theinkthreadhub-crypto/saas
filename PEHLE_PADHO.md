# Pehle Padho — 3 AI ke saath kaam kaise karein

Ye folder aapke software ka "dimaag" hai. Teeno AI (Claude, Antigravity, Codex) inhi files ko padh kar
samjhenge ki kya banana hai, kitna ho gaya, aur aage kya karna hai.

## Kaunsi file kya hai
| File | Kya hai |
|---|---|
| `AGENTS.md` | Teeno AI ke liye niyam (sabse zaroori). Antigravity aur Codex ise khud padhte hain |
| `CLAUDE.md` | Claude ke liye: bas AGENTS.md ko jod deta hai |
| `docs/MASTER_PLAN.md` | Owner ka poora plan: kya, kaise, kab — taaki kuch na chhoote |
| `docs/PHASE_PROMPTS.md` | Har phase ke copy-paste prompt — kis AI ko kya dena hai |
| `docs/VISION.md` | Hum kya bana rahe hain aur kyun |
| `docs/ARCHITECTURE.md` | Software ka poora naksha |
| `docs/COMPETITORS.md` | Competitors ki achhi cheezein jo lenge, aur unki kamiyan jo theek karenge |
| `docs/PROGRESS.md` | Kaam ki list: kya ho gaya, kya chal raha, kisne kiya |
| `docs/DECISIONS.md` | Liye gaye faisle aur unke kaaran |
| `docs/STORAGE.md` | Database aur backup chhota kaise rakhein |
| `docs/TESTING.md` | Software test kaise karein |

## Kaise use karein
1. Ye poora folder GitHub par ek private repo mein daal do (repo ka root yahi folder ho).
2. Teeno AI ko wahi repo kholne do.
3. Har AI ko kaam dete waqt bas itna likho:
   > "AGENTS.md aur docs/PROGRESS.md padho, agla khaali task uthao, poora karo, aur PROGRESS.md update karo."
4. Ek waqt mein ek AI ko ek hi task do. Do AI ko same task kabhi mat do.
5. Har kaam ke baad PROGRESS.md ka "Handoff Log" padh lo. Wahan likha hoga kya hua aur aage kya.
6. Koi faisla badalna ho (jaise database, naam), to DECISIONS.md mein naya entry likhwao.

## Aapka kaam (owner)
- PROGRESS.md mein "Questions for owner" ke jawab dena
- Har phase ke baad demo dekhna aur feedback dena
- Product ka naam final karke DECISIONS.md #11 mein likhwana
