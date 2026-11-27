// SAME FILE in src/sqlite and src/pg — edit both together (a test checks they are identical).
/** Outbox (sync queue), money audit (permanent) and activity log (short-lived). */
import { sql } from "drizzle-orm";
import { ACTIVITY_KINDS, inList, OUTBOX_OPS, OUTBOX_STATUSES } from "../enums.js";
import { check, epochMs, index, int, json, str, table, uuidRef } from "./dialect.js";
import { devices, users } from "./org.js";
import { base } from "./tenancy.js";

/**
 * One row per change to push to the cloud, written in the same transaction as the change.
 * The outbox row id is sent as the Idempotency-Key (golden rule 6). Synced rows are purged after 7 days.
 */
export const outbox = table(
  "outbox",
  {
    ...base(),
    deviceId: uuidRef("device_id").references(() => devices.id),
    /** Table name, e.g. "vouchers". */
    entity: str("entity").notNull(),
    entityId: uuidRef("entity_id").notNull(),
    op: str("op").notNull(),
    payload: json("payload").notNull(),
    status: str("status").notNull().default("pending"),
    attempts: int("attempts").notNull().default(0),
    lastError: str("last_error"),
    syncedAt: epochMs("synced_at"),
  },
  (t) => [
    index("outbox_status_idx").on(t.status, t.createdAt),
    check("outbox_op_chk", sql.raw(`op IN (${inList(OUTBOX_OPS)})`)),
    check("outbox_status_chk", sql.raw(`status IN (${inList(OUTBOX_STATUSES)})`)),
  ],
);

/**
 * Money audit (DECISIONS #25): bill create/edit/cancel, discount, price change, stock adjust, permission change...
 * Append-only and never auto-deleted. Stores only the changed fields (STORAGE.md).
 */
export const auditLog = table(
  "audit_log",
  {
    ...base(),
    userId: uuidRef("user_id").references(() => users.id),
    deviceId: uuidRef("device_id").references(() => devices.id),
    entity: str("entity").notNull(),
    entityId: uuidRef("entity_id").notNull(),
    /** e.g. "create", "edit", "cancel", "price_change", "delete_attempt" */
    action: str("action").notNull(),
    reason: str("reason"),
    diff: json("diff"),
  },
  (t) => [
    index("audit_log_entity_idx").on(t.entity, t.entityId),
    index("audit_log_company_time_idx").on(t.companyId, t.createdAt),
  ],
);

/** Activity log (DECISIONS #25): screens kept 7 days, clicks kept 3 days. No customer data. */
export const activityLog = table(
  "activity_log",
  {
    ...base(),
    userId: uuidRef("user_id").references(() => users.id),
    deviceId: uuidRef("device_id").references(() => devices.id),
    kind: str("kind").notNull(),
    /** Screen or button name, e.g. "billing" or "billing.save". */
    name: str("name").notNull(),
  },
  (t) => [
    index("activity_log_company_time_idx").on(t.companyId, t.createdAt),
    check("activity_log_kind_chk", sql.raw(`kind IN (${inList(ACTIVITY_KINDS)})`)),
  ],
);
