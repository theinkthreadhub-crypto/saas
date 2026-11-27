/**
 * SQLite dialect (local desktop DB). Everything that differs between SQLite and Postgres lives in this file only.
 * Money = integer paise · quantity = integer milli-units · time = epoch ms · ids = UUID v7 as text · dates = "YYYY-MM-DD".
 * The table files next to this one are byte-identical to the ones in ../pg (checked by a test).
 */
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export { check, index, uniqueIndex };
export const table = sqliteTable;
export const DIALECT = "sqlite" as const;

export const id = () => text("id").primaryKey();
export const uuidRef = (name: string) => text(name);
export const str = (name: string) => text(name);
export const money = (name: string) => integer(name, { mode: "number" });
export const qtyMilli = (name: string) => integer(name, { mode: "number" });
export const int = (name: string) => integer(name, { mode: "number" });
export const bool = (name: string) => integer(name, { mode: "boolean" });
export const epochMs = (name: string) => integer(name, { mode: "number" });
export const dateText = (name: string) => text(name);
export const json = (name: string) => text(name, { mode: "json" }).$type<Record<string, unknown>>();
