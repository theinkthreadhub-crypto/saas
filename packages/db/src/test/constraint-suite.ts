/**
 * The same database-level safety checks, run against SQLite and Postgres.
 * Note: raw SQL money literals are paise on SQLite but rupees on Postgres. These tests only check constraints, not amounts.
 */
import { describe, expect, it } from "vitest";
import { uuidv7 } from "@setupro/core";
import type { Dialect } from "../migration-files.js";
import { TABLE_NAMES } from "../tables.js";
import { entryRow, insertSql, saleRow, seed, type Seed } from "./fixtures.js";

export interface TestDb {
  exec(sql: string): Promise<void>;
  rows(sql: string): Promise<Record<string, unknown>[]>;
}

export function constraintSuite(dialect: Dialect, open: () => Promise<TestDb>): void {
  async function ready(): Promise<{ db: TestDb; s: Seed }> {
    const db = await open();
    const s = seed(dialect);
    for (const statement of s.statements) await db.exec(statement);
    return { db, s };
  }
  const count = async (db: TestDb, table: string) =>
    Number((await db.rows(`SELECT COUNT(*) AS n FROM "${table}"`))[0]?.n);

  describe(`${dialect}: migrations and constraints`, () => {
    it("creates every core table", async () => {
      const db = await open();
      for (const table of TABLE_NAMES) expect(await count(db, table)).toBe(0);
    });

    it("rejects a second bill with the same company + year + series + number (golden rule 7)", async () => {
      const { db, s } = await ready();
      await db.exec(insertSql(dialect, "vouchers", saleRow(dialect, s)));
      await expect(db.exec(insertSql(dialect, "vouchers", saleRow(dialect, s)))).rejects.toThrow();
      await db.exec(insertSql(dialect, "vouchers", saleRow(dialect, s, { bill_no: 2 })));
      await db.exec(insertSql(dialect, "vouchers", saleRow(dialect, s, { fin_year: "2027-28" })));
      expect(await count(db, "vouchers")).toBe(3);
    });

    it("posting the same voucher id twice keeps one row (golden rule 6)", async () => {
      const { db, s } = await ready();
      const row = saleRow(dialect, s);
      await db.exec(insertSql(dialect, "vouchers", row, true));
      await db.exec(insertSql(dialect, "vouchers", row, true));
      expect(await count(db, "vouchers")).toBe(1);
    });

    it("a cancelled voucher must have a reason and time (golden rule 3)", async () => {
      const { db, s } = await ready();
      await expect(
        db.exec(insertSql(dialect, "vouchers", saleRow(dialect, s, { status: "cancelled" }))),
      ).rejects.toThrow();
      const cancelledAt = dialect === "sqlite" ? 1795764085950 : "2026-11-27T11:00:00.000Z";
      const ok = saleRow(dialect, s, {
        status: "cancelled",
        cancel_reason: "Wrong item",
        cancelled_at: cancelledAt,
      });
      await db.exec(insertSql(dialect, "vouchers", ok));
    });

    it("rejects unknown voucher type and status", async () => {
      const { db, s } = await ready();
      await expect(
        db.exec(insertSql(dialect, "vouchers", saleRow(dialect, s, { type: "gift" }))),
      ).rejects.toThrow();
      await expect(
        db.exec(insertSql(dialect, "vouchers", saleRow(dialect, s, { status: "deleted" }))),
      ).rejects.toThrow();
    });

    it("a ledger line is debit OR credit, positive, never both or zero", async () => {
      const { db, s } = await ready();
      const v = saleRow(dialect, s);
      await db.exec(insertSql(dialect, "vouchers", v));
      const vid = String(v.id);
      await db.exec(insertSql(dialect, "ledger_entries", entryRow(dialect, s, vid, { debit: 4500 })));
      await db.exec(
        insertSql(
          dialect,
          "ledger_entries",
          entryRow(dialect, s, vid, { ledger_id: s.ids.sales, credit: 4500 }),
        ),
      );
      for (const bad of [{ debit: 100, credit: 100 }, { debit: 0, credit: 0 }, { debit: -100 }, {}]) {
        await expect(
          db.exec(insertSql(dialect, "ledger_entries", entryRow(dialect, s, vid, bad))),
        ).rejects.toThrow();
      }
      expect(await count(db, "ledger_entries")).toBe(2);
    });

    it("rejects a stock move of zero quantity", async () => {
      const { db, s } = await ready();
      const v = saleRow(dialect, s);
      await db.exec(insertSql(dialect, "vouchers", v));
      const now = dialect === "sqlite" ? 1795764085950 : "2026-11-27T10:00:00.000Z";
      const move = (qty: number) => ({
        id: uuidv7(),
        tenant_id: s.ids.tenant,
        company_id: s.ids.company,
        created_at: now,
        updated_at: now,
        voucher_id: String(v.id),
        item_id: s.ids.item,
        godown_id: s.ids.godown,
        date: "2026-11-27",
        qty_milli: qty,
      });
      await db.exec(insertSql(dialect, "stock_moves", move(-1500)));
      await expect(db.exec(insertSql(dialect, "stock_moves", move(0)))).rejects.toThrow();
    });

    it("rejects rows that point to a company that does not exist", async () => {
      const { db, s } = await ready();
      await expect(
        db.exec(insertSql(dialect, "vouchers", saleRow(dialect, s, { company_id: uuidv7() }))),
      ).rejects.toThrow();
    });

    it("two devices in one company cannot share a bill series letter", async () => {
      const { db, s } = await ready();
      const now = dialect === "sqlite" ? 1795764085950 : "2026-11-27T10:00:00.000Z";
      const device = {
        id: uuidv7(),
        tenant_id: s.ids.tenant,
        company_id: s.ids.company,
        created_at: now,
        updated_at: now,
        outlet_id: s.ids.outlet,
        name: "Counter 2",
        series: "A",
      };
      await expect(db.exec(insertSql(dialect, "devices", device))).rejects.toThrow();
      await db.exec(insertSql(dialect, "devices", { ...device, series: "B" }));
    });
  });
}
