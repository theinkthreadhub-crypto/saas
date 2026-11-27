import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { migrationStatements } from "./migration-files.js";
import { constraintSuite, type TestDb } from "./test/constraint-suite.js";

// Node's built-in SQLite. Loaded through require because Vite does not know the "node:sqlite" builtin yet.
const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite") as typeof import("node:sqlite");

function openSqlite(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const statement of migrationStatements("sqlite")) db.exec(statement);
  return db;
}

constraintSuite("sqlite", async (): Promise<TestDb> => {
  const db = openSqlite();
  return {
    exec: async (sql) => void db.exec(sql),
    rows: async (sql) => db.prepare(sql).all() as Record<string, unknown>[],
  };
});

describe("sqlite: file health", () => {
  it("passes quick_check after migrations", () => {
    const db = openSqlite();
    expect(db.prepare("PRAGMA quick_check").all()).toEqual([{ quick_check: "ok" }]);
  });

  it("stores money as INTEGER paise, never REAL (golden rule 4)", () => {
    const db = openSqlite();
    const cols = db
      .prepare(
        "SELECT lower(type) AS type FROM pragma_table_info('vouchers') WHERE name IN ('total','cgst','round_off')",
      )
      .all();
    expect(cols).toEqual([{ type: "integer" }, { type: "integer" }, { type: "integer" }]);
  });
});
