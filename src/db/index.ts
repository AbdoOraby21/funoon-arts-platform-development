import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Neon integration injects NEON_DATABASE_URL; keep DATABASE_URL for
// compatibility with deployments that use the generic variable name.
const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("A Neon database connection string is required (DATABASE_URL or NEON_DATABASE_URL)");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
