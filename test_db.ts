/**
 * Smoke test da conexão com o Postgres. Roda com: npx tsx test_db.ts
 * Lista o que existe em cada tabela — útil pra conferir o resultado da migração.
 */
import dotenv from "dotenv";

dotenv.config();

const { pool, query } = await import("./server/db.js");

const TABELAS = [
  "admin_users",
  "arquivos",
  "eventos",
  "evento_inscricoes",
  "denuncias",
  "denuncia_leads",
  "denuncia_formulario_acessos",
  "campanhas",
  "voluntarios",
  "abaixo_assinado_assinaturas",
];

async function run() {
  console.log("Contagem por tabela:\n");

  for (const tabela of TABELAS) {
    try {
      const { rows } = await query<{ total: number }>(`SELECT count(*)::int AS total FROM ${tabela}`);
      console.log(`  ${tabela.padEnd(30)} ${rows[0].total}`);
    } catch (e) {
      console.log(`  ${tabela.padEnd(30)} — ${(e as Error).message}`);
    }
  }

  const { rows: denuncias } = await query<{ slug: string; pdf_url: string }>(
    "SELECT slug, pdf_url FROM denuncias ORDER BY criado_em DESC"
  );
  if (denuncias.length > 0) {
    console.log("\nDenúncias e seus PDFs:\n");
    denuncias.forEach((d) => console.log(`  /${d.slug} -> ${d.pdf_url || "(sem PDF)"}`));
  }

  await pool.end();
}

run();
