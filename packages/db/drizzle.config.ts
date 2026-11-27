import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../../.env.local" });
config({ path: "../../.env" });

// Migrations must use the DIRECT (non-pooled) connection.
const url = process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"];

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dbCredentials: { url: url ?? "" },
  strict: true,
});
