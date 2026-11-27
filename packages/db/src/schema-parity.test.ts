import { readFileSync } from "node:fs";
import { getTableConfig as pgConfig, type PgTable } from "drizzle-orm/pg-core";
import { getTableConfig as sqliteConfig, type SQLiteTable } from "drizzle-orm/sqlite-core";
import { describe, expect, it } from "vitest";
import * as pg from "./pg/schema.js";
import * as sqlite from "./sqlite/schema.js";
import { TABLE_NAMES } from "./tables.js";

const SHARED_FILES = ["tenancy", "org", "masters", "vouchers", "system", "schema"];
const isTable = (v: unknown) =>
  typeof v === "object" && v !== null && Symbol.for("drizzle:IsDrizzleTable") in v;

function shape(config: ReturnType<typeof pgConfig> | ReturnType<typeof sqliteConfig>) {
  return {
    columns: config.columns.map((c) => ({
      name: c.name,
      notNull: c.notNull,
      primary: c.primary,
      hasDefault: c.hasDefault,
    })),
    indexes: config.indexes.map((i) => i.config.name).sort(),
    checks: config.checks.map((c) => c.name).sort(),
    foreignKeys: config.foreignKeys.length,
  };
}

const pgTables = Object.values(pg)
  .filter(isTable)
  .map((t) => pgConfig(t as PgTable));
const sqliteTables = Object.values(sqlite)
  .filter(isTable)
  .map((t) => sqliteConfig(t as SQLiteTable));

describe("SQLite and Postgres schemas are the same", () => {
  it("table files are byte-identical; only dialect.ts differs", () => {
    for (const f of SHARED_FILES) {
      const a = readFileSync(new URL(`./sqlite/${f}.ts`, import.meta.url), "utf8");
      const b = readFileSync(new URL(`./pg/${f}.ts`, import.meta.url), "utf8");
      expect(b, `${f}.ts differs`).toBe(a);
    }
  });

  it("both define exactly the core tables", () => {
    expect(pgTables.map((t) => t.name).sort()).toEqual([...TABLE_NAMES].sort());
    expect(sqliteTables.map((t) => t.name).sort()).toEqual([...TABLE_NAMES].sort());
  });

  it.each([...TABLE_NAMES])("%s has the same columns, indexes and checks", (name) => {
    const a = sqliteTables.find((t) => t.name === name);
    const b = pgTables.find((t) => t.name === name);
    expect(a && shape(a)).toEqual(b && shape(b));
  });
});

describe("golden rule 5: id, tenant_id, company_id, timestamps", () => {
  const TENANT_LEVEL = ["tenants", "companies", "roles", "users"]; // DECISIONS #30
  it.each([...TABLE_NAMES])("%s", (name) => {
    const cols = pgTables.find((t) => t.name === name)?.columns.map((c) => c.name) ?? [];
    expect(cols).toEqual(expect.arrayContaining(["id", "created_at", "updated_at"]));
    if (name !== "tenants") expect(cols).toContain("tenant_id");
    if (!TENANT_LEVEL.includes(name)) expect(cols).toContain("company_id");
  });

  it("no float columns anywhere (golden rule 4)", () => {
    for (const t of pgTables)
      for (const c of t.columns) expect(c.getSQLType()).not.toMatch(/real|double|float/i);
    for (const t of sqliteTables)
      for (const c of t.columns) expect(c.getSQLType()).not.toMatch(/real|double|float/i);
  });
});
