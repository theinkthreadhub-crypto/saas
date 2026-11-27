// SAME FILE in src/sqlite and src/pg — edit both together (a test checks they are identical).
/** Outlets, devices, roles and users. */
import { sql } from "drizzle-orm";
import { inList, RECORD_STATUSES } from "../enums.js";
import { bool, check, epochMs, index, json, str, table, uniqueIndex, uuidRef } from "./dialect.js";
import { base, tenantBase } from "./tenancy.js";

const statusCheck = (name: string) => check(name, sql.raw(`status IN (${inList(RECORD_STATUSES)})`));

/** Billing unit inside a company: shop, Rooms, Restaurant, Bar... (DECISIONS #19). */
export const outlets = table(
  "outlets",
  {
    ...base(),
    name: str("name").notNull(),
    /** Short code used in bill series, e.g. "R" for Restaurant. */
    code: str("code").notNull(),
    status: str("status").notNull().default("active"),
  },
  (t) => [uniqueIndex("outlets_code_uq").on(t.companyId, t.code), statusCheck("outlets_status_chk")],
);

/** A PC, phone or the web app. Each device has its own bill series letter (golden rule 7). */
export const devices = table(
  "devices",
  {
    ...base(),
    outletId: uuidRef("outlet_id")
      .notNull()
      .references(() => outlets.id),
    name: str("name").notNull(),
    /** Bill series prefix for this device, e.g. "A" → A-0001. The web app uses "W". */
    series: str("series").notNull(),
    appVersion: str("app_version"),
    lastSeenAt: epochMs("last_seen_at"),
    status: str("status").notNull().default("active"),
  },
  (t) => [uniqueIndex("devices_series_uq").on(t.companyId, t.series), statusCheck("devices_status_chk")],
);

export const roles = table(
  "roles",
  {
    ...tenantBase(),
    name: str("name").notNull(),
    /** Permission matrix module × action, e.g. { "sale": ["view","create"] }. Shape is finalised in the User Master task. */
    permissions: json("permissions").notNull(),
    /** Default roles (Owner, Manager, Cashier...) cannot be deleted. */
    isSystem: bool("is_system").notNull().default(false),
  },
  (t) => [uniqueIndex("roles_name_uq").on(t.tenantId, t.name)],
);

export const users = table(
  "users",
  {
    ...tenantBase(),
    /** Mobile number or username used to log in (DECISIONS #12). */
    loginId: str("login_id").notNull(),
    name: str("name").notNull(),
    roleId: uuidRef("role_id")
      .notNull()
      .references(() => roles.id),
    /** argon2 hash only. The password itself is never stored (DECISIONS #13). */
    passwordHash: str("password_hash"),
    /** Counter staff PIN, hashed. */
    pinHash: str("pin_hash"),
    mustChangePassword: bool("must_change_password").notNull().default(false),
    lastLoginAt: epochMs("last_login_at"),
    status: str("status").notNull().default("active"),
  },
  (t) => [
    uniqueIndex("users_login_uq").on(t.loginId),
    index("users_tenant_idx").on(t.tenantId),
    statusCheck("users_status_chk"),
  ],
);
