/** Test-only helpers: build plain INSERT statements that work on both SQLite and Postgres. */
import { uuidv7 } from "@setupro/core";
import type { Dialect } from "../migration-files.js";

type Value = string | number | boolean | null;

export function insertSql(
  dialect: Dialect,
  table: string,
  row: Record<string, Value>,
  onConflictIdNothing = false,
): string {
  const cols = Object.keys(row).map((c) => `"${c}"`);
  const vals = Object.values(row).map((v) => literal(dialect, v));
  const tail = onConflictIdNothing ? ' ON CONFLICT ("id") DO NOTHING' : "";
  return `INSERT INTO "${table}" (${cols.join(", ")}) VALUES (${vals.join(", ")})${tail}`;
}

function literal(dialect: Dialect, v: Value): string {
  if (v === null) return "NULL";
  if (typeof v === "boolean") return dialect === "sqlite" ? (v ? "1" : "0") : v ? "TRUE" : "FALSE";
  if (typeof v === "number") return String(v);
  return `'${v.replace(/'/g, "''")}'`;
}

export interface Seed {
  ids: Record<
    "tenant" | "company" | "outlet" | "device" | "unit" | "item" | "godown" | "cash" | "sales",
    string
  >;
  statements: string[];
}

/** A tenant with one company, outlet, device, unit, item, godown and two ledgers (Cash, Sales). */
export function seed(dialect: Dialect): Seed {
  const now = dialect === "sqlite" ? 1795764085950 : "2026-11-27T10:00:00.000Z";
  const ids = {
    tenant: uuidv7(),
    company: uuidv7(),
    outlet: uuidv7(),
    device: uuidv7(),
    unit: uuidv7(),
    item: uuidv7(),
    godown: uuidv7(),
    cash: uuidv7(),
    sales: uuidv7(),
  };
  const t = { created_at: now, updated_at: now };
  const b = { tenant_id: ids.tenant, company_id: ids.company, ...t };
  const statements = [
    insertSql(dialect, "tenants", { id: ids.tenant, name: "Demo Account", ...t }),
    insertSql(dialect, "companies", {
      id: ids.company,
      tenant_id: ids.tenant,
      name: "Demo Kirana",
      state_code: "09",
      ...t,
    }),
    insertSql(dialect, "outlets", { id: ids.outlet, ...b, name: "Main shop", code: "M" }),
    insertSql(dialect, "devices", {
      id: ids.device,
      ...b,
      outlet_id: ids.outlet,
      name: "Counter 1",
      series: "A",
    }),
    insertSql(dialect, "units", { id: ids.unit, ...b, name: "Kilogram", symbol: "kg", decimals: 3 }),
    insertSql(dialect, "items", {
      id: ids.item,
      ...b,
      name: "Sugar",
      unit_id: ids.unit,
      gst_rate_bp: 500,
      sale_rate: 4500,
    }),
    insertSql(dialect, "godowns", { id: ids.godown, ...b, name: "Shop floor" }),
    insertSql(dialect, "ledgers", { id: ids.cash, ...b, name: "Cash", group: "cash", is_system: true }),
    insertSql(dialect, "ledgers", { id: ids.sales, ...b, name: "Sales", group: "sales", is_system: true }),
  ];
  return { ids, statements };
}

/** Columns for a sale voucher row; override any field. */
export function saleRow(dialect: Dialect, s: Seed, over: Record<string, Value> = {}): Record<string, Value> {
  const now = dialect === "sqlite" ? 1795764085950 : "2026-11-27T10:00:00.000Z";
  return {
    id: uuidv7(),
    tenant_id: s.ids.tenant,
    company_id: s.ids.company,
    created_at: now,
    updated_at: now,
    outlet_id: s.ids.outlet,
    device_id: s.ids.device,
    type: "sale",
    date: "2026-11-27",
    fin_year: "2026-27",
    series: "A",
    bill_no: 1,
    taxable: 4500,
    total: 4500,
    ...over,
  };
}

export function entryRow(
  dialect: Dialect,
  s: Seed,
  voucherId: string,
  over: Record<string, Value>,
): Record<string, Value> {
  const now = dialect === "sqlite" ? 1795764085950 : "2026-11-27T10:00:00.000Z";
  return {
    id: uuidv7(),
    tenant_id: s.ids.tenant,
    company_id: s.ids.company,
    created_at: now,
    updated_at: now,
    voucher_id: voucherId,
    ledger_id: s.ids.cash,
    date: "2026-11-27",
    ...over,
  };
}
