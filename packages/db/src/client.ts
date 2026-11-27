import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { HttpsProxyAgent } from "https-proxy-agent";
import pg from "pg";
import WebSocket from "ws";
import * as schema from "./schema/index.js";

/**
 * Cloud database client (Neon Postgres today, any Postgres tomorrow).
 *
 * DB_DRIVER=pg (default): node-postgres over TCP 5432. Use on a Node/Docker VPS and on Cloudflare Workers
 *   with Hyperdrive. Moving off Neon later only changes DATABASE_URL (golden rule 10).
 * DB_DRIVER=neon-ws: Neon serverless driver over WebSocket (port 443). Use where TCP 5432 is blocked
 *   (some offices, CI sandboxes, edge runtimes). Same query API and full transactions.
 *
 * App traffic uses the pooled URL (DATABASE_URL). Migrations use the direct URL (DATABASE_URL_UNPOOLED).
 */
export type DbDriver = "pg" | "neon-ws";

function useNeonWebSocket(): void {
  const proxy = process.env["HTTPS_PROXY"] ?? process.env["https_proxy"];
  const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
  neonConfig.webSocketConstructor = class extends WebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      super(url, protocols, agent ? { agent } : {});
    }
  };
}

export function createDb(
  connectionString: string | undefined = process.env["DATABASE_URL"],
  driver: DbDriver = (process.env["DB_DRIVER"] as DbDriver | undefined) ?? "pg",
) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it.");
  }
  if (driver === "neon-ws") {
    useNeonWebSocket();
    const pool = new NeonPool({ connectionString, max: 5 });
    return { db: drizzleNeon(pool, { schema }), driver: "neon-ws" as const, close: () => pool.end() };
  }
  const pool = new pg.Pool({ connectionString, max: 5 });
  return { db: drizzlePg(pool, { schema }), driver: "pg" as const, close: () => pool.end() };
}

export type Db = ReturnType<typeof createDb>["db"];
