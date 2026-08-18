
export const pool = globalThis.__pg;
export async function query(text, params) { return globalThis.__pg.query(text, params); }
export async function queryOne(text, params) { const r = await globalThis.__pg.query(text, params); return r.rows[0] ?? null; }
export async function runMigrations() {}
