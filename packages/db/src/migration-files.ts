/**
 * Node-only: read the generated migration SQL in journal order, split into single statements.
 * Used by tests now and by `pnpm db:migrate` later. Not exported from index.ts (browser/Tauri builds must not pull node:fs).
 */
import { readFileSync } from "node:fs";

export type Dialect = "sqlite" | "pg";

interface Journal {
  entries: { idx: number; tag: string }[];
}

export function migrationStatements(dialect: Dialect): string[] {
  const dir = new URL(`../migrations/${dialect}/`, import.meta.url);
  const journal = JSON.parse(readFileSync(new URL("meta/_journal.json", dir), "utf8")) as Journal;
  return [...journal.entries]
    .sort((a, b) => a.idx - b.idx)
    .flatMap((entry) =>
      readFileSync(new URL(`${entry.tag}.sql`, dir), "utf8").split("--> statement-breakpoint"),
    )
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}
