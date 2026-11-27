// SAME FILE in src/sqlite and src/pg — edit both together (a test checks they are identical).
/** Masters: units, items, godowns, ledgers, parties. */
import { sql } from "drizzle-orm";
import { inList, LEDGER_GROUPS, PARTY_KINDS } from "../enums.js";
import {
  bool,
  check,
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
import { outlets } from "./org.js";
import { base } from "./tenancy.js";

export const units = table(
  "units",
  {
    ...base(),
    name: str("name").notNull(),
    /** e.g. "kg", "pcs", "ltr" */
    symbol: str("symbol").notNull(),
    /** Allowed decimals in quantity, 0–3. */
    decimals: int("decimals").notNull().default(0),
  },
  (t) => [
    uniqueIndex("units_symbol_uq").on(t.companyId, t.symbol),
    check("units_decimals_chk", sql.raw("decimals BETWEEN 0 AND 3")),
  ],
);

export const items = table(
  "items",
  {
    ...base(),
    name: str("name").notNull(),
    code: str("code"),
    barcode: str("barcode"),
    hsn: str("hsn"),
    unitId: uuidRef("unit_id")
      .notNull()
      .references(() => units.id),
    /** GST rate in basis points: 18% = 1800, 2.5% = 250. Integer, never a float. */
    gstRateBp: int("gst_rate_bp").notNull().default(0),
    saleRate: money("sale_rate").notNull().default(0),
    purchaseRate: money("purchase_rate").notNull().default(0),
    mrp: money("mrp"),
    /** Low stock alert level, in milli-units (1.5 kg = 1500). */
    lowStockMilli: qtyMilli("low_stock_milli"),
    isActive: bool("is_active").notNull().default(true),
    /** Pack-only extra fields (golden rule 9). */
    attributes: json("attributes"),
  },
  (t) => [
    index("items_company_name_idx").on(t.companyId, t.name),
    index("items_barcode_idx").on(t.companyId, t.barcode),
    check("items_gst_rate_chk", sql.raw("gst_rate_bp BETWEEN 0 AND 10000")),
  ],
);

export const godowns = table(
  "godowns",
  {
    ...base(),
    outletId: uuidRef("outlet_id").references(() => outlets.id),
    name: str("name").notNull(),
  },
  (t) => [uniqueIndex("godowns_name_uq").on(t.companyId, t.name)],
);

export const ledgers = table(
  "ledgers",
  {
    ...base(),
    name: str("name").notNull(),
    group: str("group").notNull(),
    /** Ledgers the voucher engine posts to (Cash, Sales, CGST...). Cannot be deleted or renamed by users. */
    isSystem: bool("is_system").notNull().default(false),
  },
  (t) => [
    uniqueIndex("ledgers_name_uq").on(t.companyId, t.name),
    check("ledgers_group_chk", sql.raw(`"group" IN (${inList(LEDGER_GROUPS)})`)),
  ],
);

export const parties = table(
  "parties",
  {
    ...base(),
    name: str("name").notNull(),
    kind: str("kind").notNull(),
    mobile: str("mobile"),
    gstin: str("gstin"),
    /** 2-digit GST state code; decides CGST+SGST vs IGST on bills to this party. */
    stateCode: str("state_code"),
    address: str("address"),
    /** Each party has its own ledger (Debtors/Creditors group). */
    ledgerId: uuidRef("ledger_id")
      .notNull()
      .references(() => ledgers.id),
    creditLimit: money("credit_limit"),
    attributes: json("attributes"),
  },
  (t) => [
    index("parties_company_name_idx").on(t.companyId, t.name),
    index("parties_mobile_idx").on(t.companyId, t.mobile),
    check("parties_kind_chk", sql.raw(`kind IN (${inList(PARTY_KINDS)})`)),
  ],
);
