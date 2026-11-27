/**
 * Postgres dialect (cloud DB on Neon). Everything that differs between SQLite and Postgres lives in this file only.
 * Money is stored as NUMERIC(14,2) (golden rule 4) but code always sees integer paise, same as SQLite.
 * Time is TIMESTAMPTZ but code always sees epoch ms, same as SQLite.
 * The table files next to this one are byte-identical to the ones in ../sqlite (checked by a test).
 */
import {
  bigint,
  boolean,
  check,
  customType,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { rupeesToPaise, type Paise } from "@setupro/core";

export { check, index, uniqueIndex };
export const table = pgTable;
export const DIALECT = "pg" as const;

/** 12345 paise → "123.45" (exact, no floats). */
export function paiseToNumeric(paise: Paise): string {
  if (!Number.isSafeInteger(paise)) throw new RangeError(`Money must be whole paise, got ${paise}`);
  const sign = paise < 0 ? "-" : "";
  const abs = Math.abs(paise);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

const numericMoney = customType<{ data: Paise; driverData: string }>({
  dataType: () => "numeric(14, 2)",
  toDriver: (value) => paiseToNumeric(value),
  fromDriver: (value) => rupeesToPaise(String(value)),
});

const timestampMs = customType<{ data: number; driverData: string | Date }>({
  dataType: () => "timestamp with time zone",
  toDriver: (value) => new Date(value).toISOString(),
  fromDriver: (value) => (value instanceof Date ? value.getTime() : Date.parse(value)),
});

export const id = () => uuid("id").primaryKey();
export const uuidRef = (name: string) => uuid(name);
export const str = (name: string) => text(name);
export const money = (name: string) => numericMoney(name);
export const qtyMilli = (name: string) => bigint(name, { mode: "number" });
export const int = (name: string) => integer(name);
export const bool = (name: string) => boolean(name);
export const epochMs = (name: string) => timestampMs(name);
export const dateText = (name: string) => date(name, { mode: "string" });
export const json = (name: string) => jsonb(name).$type<Record<string, unknown>>();
