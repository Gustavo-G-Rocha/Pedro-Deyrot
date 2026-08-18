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

// O Postgres do Railway usa certificado self-signed no proxy publico.
const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

export const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
});

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
