import { timestamp, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "@setupro/core";

/** Golden rule 5: every table has id (UUID v7), created_at, updated_at. */
export const idColumn = () =>
  uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7());

export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
