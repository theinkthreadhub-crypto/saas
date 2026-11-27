/** Every core table, in dependency order (parents first). */
export const TABLE_NAMES = [
  "tenants",
  "companies",
  "outlets",
  "devices",
  "roles",
  "users",
  "units",
  "items",
  "godowns",
  "ledgers",
  "parties",
  "bill_series",
  "vouchers",
  "voucher_items",
  "stock_moves",
  "ledger_entries",
  "outbox",
  "audit_log",
  "activity_log",
] as const;
export type TableName = (typeof TABLE_NAMES)[number];
