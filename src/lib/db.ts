import { Pool, type PoolClient, type QueryResultRow } from "pg";

/**
 * Base de données NUTRELIS (cluster Patroni de NEXIO, via PgBouncer en mode TRANSACTION).
 * ⚠️ Pas de requêtes préparées nommées ni de `SET` de session : PgBouncer les perdrait.
 */
const globalForPool = globalThis as unknown as { nutrelisPool?: Pool };

function pool(): Pool {
  if (!globalForPool.nutrelisPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL manquante");
    globalForPool.nutrelisPool = new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 30_000 });
  }
  return globalForPool.nutrelisPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await pool().query<T>(text, params);
  return res.rows;
}

/** Transaction : tout réussit ou rien n'est écrit. */
export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}
