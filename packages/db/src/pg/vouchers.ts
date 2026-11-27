// SAME FILE in src/sqlite and src/pg — edit both together (a test checks they are identical).
/**
 * Vouchers and their entries. Reports read ONLY from ledger_entries and stock_moves (golden rule 8).
 * Vouchers are never deleted: cancel = status 'cancelled' + reason + reverse entries (golden rule 3).
 */
import { sql } from "drizzle-orm";
import { inList, VOUCHER_STATUSES, VOUCHER_TYPES } from "../enums.js";
import {
  bool,
  check,
  dateText,
  epochMs,
  index,
  int,
  json,
  money,
  qtyMilli,
  str,
  table,
  uniqueIndex,
  uuidRef,
} from "./dialect.js";
import { ledgers, godowns, items, parties, units } from "./masters.js";
import { devices, outlets, users } from "./org.js";
import { base } from "./tenancy.js";

/** Next number per series. Read and bumped inside the same transaction as the voucher (golden rule 15: no gaps). */
export const billSeries = table(
  "bill_series",
  {
    ...base(),
    outletId: uuidRef("outlet_id").references(() => outlets.id),
    deviceId: uuidRef("device_id").references(() => devices.id),
    /** e.g. "2026-27" */
    finYear: str("fin_year").notNull(),
    /** e.g. "A", "W", "RA" */
    series: str("series").notNull(),
    nextNo: int("next_no").notNull().default(1),
  },
  (t) => [
    uniqueIndex("bill_series_uq").on(t.companyId, t.finYear, t.series),
    check("bill_series_next_chk", sql.raw("next_no >= 1")),
  ],
);

export const vouchers = table(
  "vouchers",
  {
    ...base(),
    outletId: uuidRef("outlet_id")
      .notNull()
      .references(() => outlets.id),
    deviceId: uuidRef("device_id")
      .notNull()
      .references(() => devices.id),
    type: str("type").notNull(),
    status: str("status").notNull().default("active"),
    /** Bill date "YYYY-MM-DD" in shop local time. */
    date: dateText("date").notNull(),
    finYear: str("fin_year").notNull(),
    series: str("series").notNull(),
    billNo: int("bill_no").notNull(),
    partyId: uuidRef("party_id").references(() => parties.id),
    /** 2-digit GST state code of the buyer. */
    placeOfSupply: str("place_of_supply"),
    isInterState: bool("is_inter_state").notNull().default(false),
    discount: money("discount").notNull().default(0),
    taxable: money("taxable").notNull().default(0),
    cgst: money("cgst").notNull().default(0),
    sgst: money("sgst").notNull().default(0),
    igst: money("igst").notNull().default(0),
    roundOff: money("round_off").notNull().default(0),
    total: money("total").notNull().default(0),
    narration: str("narration"),
    /** Original voucher for a return or credit/debit note. */
    refVoucherId: uuidRef("ref_voucher_id"),
    cancelReason: str("cancel_reason"),
    cancelledAt: epochMs("cancelled_at"),
    cancelledBy: uuidRef("cancelled_by").references(() => users.id),
    createdBy: uuidRef("created_by").references(() => users.id),
    attributes: json("attributes"),
  },
  (t) => [
    uniqueIndex("vouchers_bill_no_uq").on(t.companyId, t.finYear, t.series, t.billNo),
    index("vouchers_company_date_idx").on(t.companyId, t.date),
    index("vouchers_party_idx").on(t.partyId),
    check("vouchers_type_chk", sql.raw(`type IN (${inList(VOUCHER_TYPES)})`)),
    check("vouchers_status_chk", sql.raw(`status IN (${inList(VOUCHER_STATUSES)})`)),
    check(
      "vouchers_cancel_chk",
      sql.raw(
        "(status = 'cancelled' AND cancel_reason IS NOT NULL AND cancelled_at IS NOT NULL) OR status <> 'cancelled'",
      ),
    ),
  ],
);

export const voucherItems = table(
  "voucher_items",
  {
    ...base(),
    voucherId: uuidRef("voucher_id")
      .notNull()
      .references(() => vouchers.id),
    lineNo: int("line_no").notNull(),
    itemId: uuidRef("item_id")
      .notNull()
      .references(() => items.id),
    unitId: uuidRef("unit_id").references(() => units.id),
    godownId: uuidRef("godown_id").references(() => godowns.id),
    hsn: str("hsn"),
    qtyMilli: qtyMilli("qty_milli").notNull(),
    rate: money("rate").notNull(),
    discount: money("discount").notNull().default(0),
    taxable: money("taxable").notNull(),
    gstRateBp: int("gst_rate_bp").notNull().default(0),
    cgst: money("cgst").notNull().default(0),
    sgst: money("sgst").notNull().default(0),
    igst: money("igst").notNull().default(0),
    total: money("total").notNull(),
    attributes: json("attributes"),
  },
  (t) => [
    uniqueIndex("voucher_items_line_uq").on(t.voucherId, t.lineNo),
    index("voucher_items_item_idx").on(t.itemId),
  ],
);

/** Every stock change. Stock balance = SUM(qty_milli). In = positive, out = negative. */
export const stockMoves = table(
  "stock_moves",
  {
    ...base(),
    voucherId: uuidRef("voucher_id")
      .notNull()
      .references(() => vouchers.id),
    voucherItemId: uuidRef("voucher_item_id").references(() => voucherItems.id),
    itemId: uuidRef("item_id")
      .notNull()
      .references(() => items.id),
    godownId: uuidRef("godown_id")
      .notNull()
      .references(() => godowns.id),
    date: dateText("date").notNull(),
    qtyMilli: qtyMilli("qty_milli").notNull(),
    /** Cost rate per unit, for stock value. */
    rate: money("rate").notNull().default(0),
  },
  (t) => [
    index("stock_moves_item_idx").on(t.companyId, t.itemId, t.godownId),
    index("stock_moves_voucher_idx").on(t.voucherId),
    check("stock_moves_qty_chk", sql.raw("qty_milli <> 0")),
  ],
);

/** Double-entry lines. For every voucher: SUM(debit) = SUM(credit). One side per line. */
export const ledgerEntries = table(
  "ledger_entries",
  {
    ...base(),
    voucherId: uuidRef("voucher_id")
      .notNull()
      .references(() => vouchers.id),
    ledgerId: uuidRef("ledger_id")
      .notNull()
      .references(() => ledgers.id),
    date: dateText("date").notNull(),
    debit: money("debit").notNull().default(0),
    credit: money("credit").notNull().default(0),
  },
  (t) => [
    index("ledger_entries_ledger_idx").on(t.companyId, t.ledgerId, t.date),
    index("ledger_entries_voucher_idx").on(t.voucherId),
    check(
      "ledger_entries_side_chk",
      sql.raw("debit >= 0 AND credit >= 0 AND (debit = 0 OR credit = 0) AND debit + credit > 0"),
    ),
  ],
);
