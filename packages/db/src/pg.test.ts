import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { describe, expect, it } from "vitest";
import { uuidv7 } from "@setupro/core";
import { migrationStatements } from "./migration-files.js";
import * as pg from "./pg/schema.js";
import { constraintSuite, type TestDb } from "./test/constraint-suite.js";
import { seed } from "./test/fixtures.js";

// PGlite = real Postgres compiled to WASM, in memory. No Docker needed for tests.
async function openPg(): Promise<PGlite> {
  const db = new PGlite();
  for (const statement of migrationStatements("pg")) await db.exec(statement);
  return db;
}

constraintSuite("pg", async (): Promise<TestDb> => {
  const db = await openPg();
  return {
    exec: async (sql) => void (await db.exec(sql)),
    rows: async (sql) => (await db.query<Record<string, unknown>>(sql)).rows,
  };
});

describe("pg: money and time round trip through Drizzle", () => {
  it("stores paise as NUMERIC(14,2) rupees and reads back the exact paise", async () => {
    const client = await openPg();
    const s = seed("pg");
    for (const statement of s.statements) await client.exec(statement);
    const db = drizzle(client, { schema: pg });
    const id = uuidv7();
    const now = Date.UTC(2026, 10, 27, 10, 30, 15, 123);
    await db.insert(pg.vouchers).values({
      id,
      tenantId: s.ids.tenant,
      companyId: s.ids.company,
      createdAt: now,
      updatedAt: now,
      outletId: s.ids.outlet,
      deviceId: s.ids.device,
      type: "sale",
      date: "2026-11-27",
      finYear: "2026-27",
      series: "A",
      billNo: 7,
      taxable: 999999999, // ₹99,99,999.99
      cgst: 2,
      roundOff: -40,
      total: 1234567,
      attributes: { batch: "B12" },
    });

    const raw = await client.query<{ total: string; round_off: string; taxable: string }>(
      `SELECT total::text, round_off::text, taxable::text FROM vouchers WHERE id = '${id}'`,
    );
    expect(raw.rows[0]).toEqual({ total: "12345.67", round_off: "-0.40", taxable: "9999999.99" });

    const [row] = await db.select().from(pg.vouchers).where(eq(pg.vouchers.id, id));
    expect(row?.total).toBe(1234567);
    expect(row?.roundOff).toBe(-40);
    expect(row?.cgst).toBe(2);
    expect(row?.taxable).toBe(999999999);
    expect(row?.createdAt).toBe(now);
    expect(row?.date).toBe("2026-11-27");
    expect(row?.isInterState).toBe(false);
    expect(row?.attributes).toEqual({ batch: "B12" });
  });
});
