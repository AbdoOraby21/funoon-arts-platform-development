import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Neon integration injects NEON_DATABASE_URL; keep DATABASE_URL for
// compatibility with deployments that use the generic variable name.
// Prefer the Neon-managed URL in deployments; DATABASE_URL is kept as a fallback
// for local or older environments that only define the generic variable.
const databaseUrl = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;

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
