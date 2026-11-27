// SAME FILE in src/sqlite and src/pg — edit both together (a test checks they are identical).
/**
 * Tenancy: tenant (one paying client account) → company (own GSTIN, own books) → outlet → device.
 * DECISIONS #19 and #30.
 */
import { sql } from "drizzle-orm";
import { inList, RECORD_STATUSES } from "../enums.js";
import { check, epochMs, id, index, str, table, uuidRef } from "./dialect.js";

export const timestamps = () => ({
  createdAt: epochMs("created_at").notNull(),
  updatedAt: epochMs("updated_at").notNull(),
});

export const tenants = table(
  "tenants",
  {
    id: id(),
    name: str("name").notNull(),
    status: str("status").notNull().default("active"),
    ...timestamps(),
  },
  (t) => [
    check("tenants_status_chk", sql.raw(`status IN (${inList(RECORD_STATUSES)})`)),
    index("tenants_status_idx").on(t.status),
  ],
);

export const companies = table(
  "companies",
  {
    id: id(),
    tenantId: uuidRef("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: str("name").notNull(),
    gstin: str("gstin"),
    /** 2-digit GST state code, e.g. "09" for Uttar Pradesh. Decides CGST+SGST vs IGST. */
    stateCode: str("state_code").notNull(),
    address: str("address"),
    phone: str("phone"),
    /** Link to the logo in R2. Never the image itself (STORAGE.md). */
    logoUrl: str("logo_url"),
    ...timestamps(),
  },
  (t) => [index("companies_tenant_idx").on(t.tenantId)],
);

/** tenant_id only: rows that belong to the whole account, not one company (users, roles). DECISIONS #30. */
export const tenantBase = () => ({
  id: id(),
  tenantId: uuidRef("tenant_id")
    .notNull()
    .references(() => tenants.id),
  ...timestamps(),
});

/** id + tenant_id + company_id + timestamps: required on every business table (golden rule 5). */
export const base = () => ({
  id: id(),
  tenantId: uuidRef("tenant_id")
    .notNull()
    .references(() => tenants.id),
  companyId: uuidRef("company_id")
    .notNull()
    .references(() => companies.id),
  ...timestamps(),
});
