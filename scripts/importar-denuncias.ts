/**
 * Importa as denuncias do site antigo (Firebase) para o Postgres.
 *
 * Diferente do migrar-firestore.ts, este NAO precisa da chave de conta de
 * servico: le pela API REST publica do Firestore e baixa os PDFs pelas URLs
 * assinadas que ja estao nos documentos.
 *
 *   1. Coloque a DATABASE_URL no .env (no Railway: servico Postgres >
 *      Variables > DATABASE_PUBLIC_URL, para rodar da sua maquina).
 *   2. npm run importar-denuncias
 *
 * Idempotente: preserva os IDs originais e usa ON CONFLICT DO NOTHING.
 * Rodar duas vezes nao duplica nada nem rebaixa os arquivos.
 *
 * NAO traz os leads (denuncias/{slug}/leads): as regras do Firestore exigem
 * autenticacao para le-los. Para esses, use o migrar-firestore.ts.
 */
import dotenv from "dotenv";

dotenv.config();

const PROJETO = process.env.FIREBASE_PROJECT_ID || "deyrot-e4381";
const API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyCOKhOFjhzEzTxirYIaggLU6YTulbP_CpI";
const FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROJETO}/databases/(default)/documents`;

// O db.ts le DATABASE_URL na carga, entao so pode entrar depois do dotenv.
const { pool, query, runMigrations } = await import("../server/db.js");

// ---------------------------------------------------------------------------
// Conversao do formato do Firestore REST para valores JS
// ---------------------------------------------------------------------------

type CampoFirestore = Record<string, unknown>;

function valor(campo: CampoFirestore | undefined): unknown {
  if (!campo) return null;
  const tipo = Object.keys(campo)[0];
  const bruto = campo[tipo];

  switch (tipo) {
    case "integerValue":
      return Number(bruto);
    case "doubleValue":
      return Number(bruto);
    case "booleanValue":
      return Boolean(bruto);
    case "nullValue":
      return null;
    case "mapValue":
      return Object.fromEntries(
        Object.entries(((bruto as { fields?: Record<string, CampoFirestore> }).fields) ?? {})
          .map(([k, v]) => [k, valor(v)])
      );
    case "arrayValue":
      return ((bruto as { values?: CampoFirestore[] }).values ?? []).map(valor);
    default:
      return bruto;
  }
}

const txt = (v: unknown) => (v === undefined || v === null ? "" : String(v));
const num = (v: unknown) => Number(v) || 0;

function paraData(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// Arquivos
// ---------------------------------------------------------------------------

const cache = new Map<string, string>();
let baixados = 0;
const erros: string[] = [];

/** Baixa a URL do Firebase Storage e grava em `arquivos`. Devolve /api/arquivos/<id>. */
async function importarArquivo(url: unknown): Promise<string> {
  const endereco = txt(url);
  if (!endereco) return "";
  if (!/firebasestorage\.googleapis\.com|storage\.googleapis\.com/.test(endereco)) return endereco;
  if (cache.has(endereco)) return cache.get(endereco)!;

  try {
    const res = await fetch(endereco);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get("content-type")?.split(";")[0] || "application/octet-stream";

    // .../o/denuncias%2F123_dossie.pdf?alt=media  ->  dossie.pdf
    const caminho = decodeURIComponent(endereco.match(/\/o\/([^?]+)/)?.[1] ?? "arquivo");
    const nome = caminho.split("/").pop() || "arquivo";

    const { rows } = await query<{ id: string }>(
      `INSERT INTO arquivos (nome, mime_type, tamanho, conteudo)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [nome, mime, buffer.length, buffer]
    );

    const nova = `/api/arquivos/${rows[0].id}`;
    cache.set(endereco, nova);
    baixados++;
    console.log(`     📎 ${nome} — ${(buffer.length / 1024).toFixed(0)} KB → ${nova}`);
    return nova;
  } catch (e) {
    const msg = `${endereco.slice(0, 80)}… → ${(e as Error).message}`;
    console.warn(`     ⚠️  falhou: ${msg}`);
    erros.push(msg);
    // Mantem a URL antiga: um link pro Firebase ainda funciona, campo vazio nao.
    return endereco;
  }
}

// ---------------------------------------------------------------------------

interface DocFirestore {
  name: string;
  fields: Record<string, CampoFirestore>;
}

async function main() {
  console.log("📄 Importando denúncias do site antigo\n");

  await runMigrations();

  const res = await fetch(`${FIRESTORE}/denuncias?key=${API_KEY}&pageSize=300`);
  if (!res.ok) {
    throw new Error(`Firestore respondeu ${res.status}. O projeto ou a API key mudou?`);
  }

  const { documents = [] } = (await res.json()) as { documents?: DocFirestore[] };
  console.log(`Encontradas ${documents.length} denúncias no Firebase.\n`);

  let novas = 0;
  let jaExistiam = 0;

  for (const doc of documents) {
    const id = doc.name.split("/").pop()!;
    const f = doc.fields;
    const titulo = txt(valor(f.titulo));
    const slug = txt(valor(f.slug)) || id;

    // Se ja veio numa execucao anterior, nao rebaixa os arquivos.
    const existente = await query("SELECT 1 FROM denuncias WHERE id = $1 OR slug = $2", [id, slug]);
    if (existente.rowCount! > 0) {
      console.log(`  ⏭️  ${titulo} (/${slug}) — já estava no banco`);
      jaExistiam++;
      continue;
    }

    console.log(`  → ${titulo} (/${slug})`);

    const pdfUrl = await importarArquivo(valor(f.pdfUrl));
    const imagemUrl = await importarArquivo(valor(f.imagemUrl));
    const est = (valor(f.estatisticas) ?? {}) as Record<string, unknown>;

    await query(
      `INSERT INTO denuncias
         (id, slug, titulo, descricao, pdf_url, imagem_url, status, formulario_ativo,
          mensagem_whatsapp, visualizacoes, downloads, formulario_envios, secoes,
          criado_em, atualizado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
               COALESCE($14, now()), COALESCE($15, now()))
       ON CONFLICT (id) DO NOTHING`,
      [
        id,
        slug,
        titulo,
        txt(valor(f.descricao)).trim(),
        pdfUrl,
        imagemUrl,
        txt(valor(f.status)) || "rascunho",
        valor(f.formularioAtivo) !== false,
        txt(valor(f.mensagemWhatsapp)),
        num(est.visualizacoes),
        num(est.downloads),
        num(est.formularioEnvios),
        JSON.stringify(valor(f.secoes) ?? []),
        paraData(valor(f.criadoEm)),
        paraData(valor(f.atualizadoEm) ?? valor(f.criadoEm)),
      ]
    );
    novas++;
  }

  const { rows: total } = await query<{ d: number; a: number; mb: string }>(
    `SELECT (SELECT count(*)::int FROM denuncias) AS d,
            (SELECT count(*)::int FROM arquivos) AS a,
            (SELECT COALESCE(pg_size_pretty(sum(tamanho)), '0 B') FROM arquivos) AS mb`
  );

  console.log(`\n✅ ${novas} denúncia(s) importada(s), ${jaExistiam} já existia(m).`);
  console.log(`   ${baixados} arquivo(s) baixado(s) nesta execução.`);
  console.log(`   Banco agora: ${total[0].d} denúncias, ${total[0].a} arquivos (${total[0].mb}).`);

  if (erros.length > 0) {
    console.log(`\n⚠️  ${erros.length} arquivo(s) não baixaram (a URL do Firebase foi mantida):`);
    erros.forEach((e) => console.log(`   - ${e}`));
  }

  console.log("\nOs leads não vêm por aqui: as regras do Firestore exigem login para lê-los.");
  console.log("Para eles, use `npm run migrar` com a chave de conta de serviço.\n");

  await pool.end();
}

// await no topo (nao main().catch): assim o modulo so resolve quando a
// importacao terminou de verdade, o que torna o script componivel e testavel.
try {
  await main();
} catch (e) {
  console.error("\n❌ Falhou:", (e as Error).message);
  await pool.end().catch(() => {});
  process.exit(1);
}
