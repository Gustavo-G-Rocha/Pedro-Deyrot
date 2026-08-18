import pg from "pg";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL nao configurada. No Railway ela e injetada pelo plugin Postgres; localmente coloque no .env"
  );
}

/**
 * Quando usar SSL:
 *  - rede interna do Railway (*.railway.internal) e localhost NAO falam TLS;
 *    forcar SSL ali derruba a conexao com "server does not support SSL".
 *  - o proxy publico (*.proxy.rlwy.net) exige SSL e usa cert self-signed,
 *    por isso o rejectUnauthorized: false.
 * sslmode na propria URL tem a ultima palavra.
 */
function configurarSsl(url: string): false | { rejectUnauthorized: boolean } {
  const sslmode = url.match(/[?&]sslmode=([^&]+)/)?.[1];
  if (sslmode === "disable") return false;
  if (sslmode) return { rejectUnauthorized: false };

  const semTls = /localhost|127\.0\.0\.1|\.railway\.internal/.test(url);
  return semTls ? false : { rejectUnauthorized: false };
}

export const pool = new Pool({
  connectionString,
  ssl: configurarSsl(connectionString),
  max: 10,
  // Sem isso o pg espera indefinidamente e o boot pendura sem dizer o motivo.
  connectionTimeoutMillis: 10_000,
});

const host = connectionString.match(/@([^/:]+)/)?.[1] ?? "?";
console.log(`🔌 [DB] host=${host} ssl=${configurarSsl(connectionString) ? "on" : "off"}`);

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

/** Retorna a primeira linha, ou null. */
export async function queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await pool.query<T>(text, params);
  return result.rows[0] ?? null;
}

/** Aplica db/schema.sql e garante que existe um admin inicial. */
export async function runMigrations() {
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  await pool.query(schema);
  console.log("✅ [DB] Schema aplicado");

  await seedAdmin();
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_PASSWORD;

  if (!email || !senha) {
    const { rows } = await pool.query("SELECT count(*)::int AS total FROM admin_users");
    if (rows[0].total === 0) {
      console.warn(
        "⚠️  [DB] Nenhum admin cadastrado e ADMIN_EMAIL/ADMIN_PASSWORD nao definidos. O login do /admin nao vai funcionar."
      );
    }
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  await pool.query(
    `INSERT INTO admin_users (email, senha_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET senha_hash = EXCLUDED.senha_hash`,
    [email.toLowerCase(), senhaHash]
  );
  console.log(`✅ [DB] Admin garantido: ${email}`);
}
