# STORAGE — keep database and backups small

Goal: **daily backups in KB, full backups in a few MB, database growing as slowly as possible.**
Data does grow with bills (a busy shop ≈ 300 bills/day). We cannot stop growth, but we can make it tiny.

## 1. Rough numbers (approx)
| Item | Raw | After our rules |
|---|---|---|
| 1 bill (items + ledger + stock rows) | ~5 KB | ~5 KB in DB, ~1 KB compressed in backup |
| 1 busy shop, 1 day (300 bills) | ~1.5 MB | **daily incremental backup ≈ 200–400 KB** |
| 1 busy shop, 1 year | ~0.5 GB | **full compressed snapshot ≈ 50–100 MB** |
| Small shop (50 bills/day), 1 year | ~90 MB | **full compressed ≈ 10–20 MB** |

## 2. Keep the DATABASE small
1. **No files inside the database.** Photos, PDFs, logos → R2. DB stores only the link.
2. **Never store generated PDFs.** Bills/receipts are re-generated on demand from data.
3. **Images:** resize to max 800 px, convert to WebP, thumbnail 200 px. Item photo ≈ 30–60 KB.
4. **Compact types:** integer paise in SQLite, small enums, no long text where an ID works.
5. **`attributes` JSONB only for pack fields**, never for large blobs.
6. **Year-wise local files:** `company_<id>_FY2026-27.db`. Closing balances carry forward. Old years archived compressed.
7. **Purge:** synced outbox after 7 days, debug logs after 30 days, notification logs after 90 days.
8. **Audit log:** store only changed fields (diff), not full row copies.
9. **Summary tables** (`daily_summary`, `stock_balance`) are small and replace heavy queries.
10. **SQLite `VACUUM`** monthly (after archive); Postgres autovacuum on.
11. **Cloud cold storage:** data older than 3 years → export to R2 as compressed Parquet (≈10× smaller), removed from hot DB, still downloadable.

## 3. Keep BACKUPS small
1. **Incremental daily:** back up only what changed today (from the outbox/changes), compressed with zstd → KB.
2. **Full weekly snapshot:** `VACUUM INTO` → zstd compress (−70–85%) → AES-256 encrypt → `.erpbak`.
3. **Restore = last full + incrementals after it.** Test restore monthly.
4. **Dedupe:** if today's backup hash = yesterday's, do not upload again.
5. **Retention:** 7 daily incrementals, 4 weekly full, 12 monthly full. Older auto-deleted.
6. **Manifest** (`manifest.json` inside): client, schema_version, from/to dates, bill_count, sha256.
7. **Where:** client PC/pendrive (offline), R2 (cloud), SetuPro Google Drive (copy via server).

## 4. Cloud database size control
- Shared DB with `tenant_id`; partition big tables by month.
- Monitor per-tenant size in Super Admin; alert at 80% of plan quota.
- Neon free stage: one project per client (1 GB each) → move to shared paid DB after 10 clients.
- Archive to R2 Parquet after 3 years.

## 5. What NOT to do
- No JSON full backups (5–10× bigger, slow restore, money/date precision issues).
- No base64 images in DB.
- No storing every report output.
- No infinite logs.
