/**
 * Allowed values for text "enum" columns. Shared by the SQLite and Postgres schemas so both stay identical.
 * Stored as plain text (not native Postgres enums) so adding a value never needs a risky migration.
 */

export const VOUCHER_TYPES = [
  "sale",
  "sale_return",
  "purchase",
  "purchase_return",
  "receipt",
  "payment",
  "journal",
  "contra",
  "stock_transfer",
] as const;
export type VoucherType = (typeof VOUCHER_TYPES)[number];

export const VOUCHER_STATUSES = ["active", "cancelled"] as const;
export type VoucherStatus = (typeof VOUCHER_STATUSES)[number];

export const PARTY_KINDS = ["customer", "supplier", "both"] as const;
export type PartyKind = (typeof PARTY_KINDS)[number];

export const LEDGER_GROUPS = [
  "cash",
  "bank",
  "sales",
  "purchase",
  "debtors",
  "creditors",
  "duties_taxes",
  "round_off",
  "direct_expense",
  "indirect_expense",
  "direct_income",
  "indirect_income",
  "capital",
  "loans",
  "fixed_assets",
  "current_assets",
  "current_liabilities",
  "stock",
] as const;
export type LedgerGroup = (typeof LEDGER_GROUPS)[number];

export const RECORD_STATUSES = ["active", "inactive", "suspended"] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const OUTBOX_OPS = ["insert", "update"] as const;
export type OutboxOp = (typeof OUTBOX_OPS)[number];

export const OUTBOX_STATUSES = ["pending", "synced", "failed"] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

export const ACTIVITY_KINDS = ["screen", "click"] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

/** Build `col IN ('a','b')` for CHECK constraints. Values are our own constants, never user input. */
export function inList(values: readonly string[]): string {
  return values.map((v) => `'${v}'`).join(", ");
}
