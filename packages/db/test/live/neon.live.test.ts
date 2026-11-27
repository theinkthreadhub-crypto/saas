import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { isUuidV7 } from "@setupro/core";
import { companies, createDb, outlets, tenants } from "../../src/index.js";

config({ path: "../../.env.local" });
config({ path: "../../.env" });

/** Runs against the real Neon database. Every write is rolled back, so no test data is left behind. */
const hasDb = Boolean(process.env["DATABASE_URL"]);
const { db, close } = hasDb ? createDb() : { db: undefined, close: async () => {} };
afterAll(() => close());

class Rollback extends Error {}

describe.skipIf(!hasDb)("Neon Postgres (live)", () => {
  it("connects through the pooled URL", async () => {
    const result = await db!.execute(sql`select current_database() as db, version() as v`);
    const row = result.rows[0] as { db: string; v: string };
    console.log(`connected: db=${row.db} | ${row.v.split(" on ")[0]}`);
    expect(row.v).toMatch(/PostgreSQL/);
  });

  it("writes tenant → company → outlet in one transaction and reads them back", async () => {
    const code = `TEST-${Date.now()}`;
    let seen: { tenant: string; company: string; outletSeries: string } | undefined;

    await expect(
      db!.transaction(async (tx) => {
        const [t] = await tx.insert(tenants).values({ clientCode: code, name: "Test Shop" }).returning();
        const [c] = await tx
          .insert(companies)
          .values({ tenantId: t!.id, name: "Test Shop Pvt Ltd", stateCode: "09" })
          .returning();
        await tx
          .insert(outlets)
          .values({ tenantId: t!.id, companyId: c!.id, name: "Counter 1", billSeries: "A" });

        const rows = await tx
          .select({
            tenant: tenants.name,
            company: companies.name,
            series: outlets.billSeries,
            id: tenants.id,
          })
          .from(outlets)
          .innerJoin(companies, eq(outlets.companyId, companies.id))
          .innerJoin(tenants, eq(outlets.tenantId, tenants.id))
          .where(eq(tenants.clientCode, code));

        expect(rows).toHaveLength(1);
        expect(isUuidV7(rows[0]!.id)).toBe(true);
        seen = { tenant: rows[0]!.tenant, company: rows[0]!.company, outletSeries: rows[0]!.series };
        throw new Rollback();
      }),
    ).rejects.toBeInstanceOf(Rollback);

    console.log(`read back inside transaction: ${JSON.stringify(seen)}`);
    expect(seen).toEqual({ tenant: "Test Shop", company: "Test Shop Pvt Ltd", outletSeries: "A" });

    const after = await db!.select().from(tenants).where(eq(tenants.clientCode, code));
    console.log(`rows left after rollback: ${after.length}`);
    expect(after).toHaveLength(0);
  });

  it("blocks a duplicate bill series in the same company (unique rule)", async () => {
    await expect(
      db!.transaction(async (tx) => {
        const [t] = await tx
          .insert(tenants)
          .values({ clientCode: `DUP-${Date.now()}`, name: "Dup" })
          .returning();
        const [c] = await tx
          .insert(companies)
          .values({ tenantId: t!.id, name: "Dup", stateCode: "09" })
          .returning();
        await tx.insert(outlets).values({ tenantId: t!.id, companyId: c!.id, name: "A1", billSeries: "A" });
        await tx.insert(outlets).values({ tenantId: t!.id, companyId: c!.id, name: "A2", billSeries: "A" });
      }),
    ).rejects.toThrow();
  });
});
