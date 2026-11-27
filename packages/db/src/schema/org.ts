import { boolean, index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { idColumn, timestamps } from "./base.js";

/**
 * Account → Company → Outlet (DECISIONS #19).
 * tenant = one paying client account (owner login). Every business row below carries tenant_id.
 */
export const tenants = pgTable(
  "tenants",
  {
    id: idColumn(),
    /** Short public client code shown in Super Admin, e.g. "SP-00042". */
    clientCode: text("client_code").notNull(),
    name: text("name").notNull(),
    status: text("status", { enum: ["active", "suspended", "expired"] })
      .notNull()
      .default("active"),
    ...timestamps(),
  },
  (t) => [uniqueIndex("tenants_client_code_uq").on(t.clientCode)],
);

/** A company has its own GSTIN and its own books. */
export const companies = pgTable(
  "companies",
  {
    id: idColumn(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    gstin: text("gstin"),
    /** Two-digit GST state code, e.g. "09" for Uttar Pradesh. Decides CGST+SGST vs IGST. */
    stateCode: text("state_code").notNull(),
    logoUrl: text("logo_url"),
    ...timestamps(),
  },
  (t) => [index("companies_tenant_idx").on(t.tenantId)],
);

/** An outlet is a billing unit: shop, branch, or hotel Rooms/Restaurant/Bar/Cafe. */
export const outlets = pgTable(
  "outlets",
  {
    id: idColumn(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    name: text("name").notNull(),
    /** Bill number prefix for this outlet, e.g. "R" for restaurant (see formatBillNo). */
    billSeries: text("bill_series").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (t) => [
    index("outlets_tenant_idx").on(t.tenantId),
    uniqueIndex("outlets_company_series_uq").on(t.companyId, t.billSeries),
  ],
);
