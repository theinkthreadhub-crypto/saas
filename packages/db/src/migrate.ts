import { config } from "dotenv";
import { migrate as migrateNeon } from "drizzle-orm/neon-serverless/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "./client.js";

/** Apply migrations with the DIRECT (non-pooled) URL. Works with both drivers. Run: pnpm db:migrate */
config({ path: "../../.env.local" });
config({ path: "../../.env" });

const url = process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"];
const conn = createDb(url);
const migrationsFolder = new URL("../migrations", import.meta.url).pathname;

try {
  if (conn.driver === "neon-ws") await migrateNeon(conn.db, { migrationsFolder });
  else await migratePg(conn.db, { migrationsFolder });
  console.log(`migrations applied (driver: ${conn.driver})`);
} finally {
  await conn.close();
}
