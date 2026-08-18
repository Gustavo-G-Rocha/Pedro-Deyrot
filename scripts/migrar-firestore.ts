/**
 * Copia todos os dados do Firebase (Firestore + Storage) para o Postgres.
 *
 *   1. Baixe a service account key:
 *      Firebase Console > Configuracoes do projeto > Contas de servico
 *      > "Gerar nova chave privada"  ->  salve como  ./firebase-service-account.json
 *
 *   2. Aponte o DATABASE_URL pro Postgres de destino (o do Railway, aba Variables,
 *      valor de DATABASE_PUBLIC_URL para rodar da sua maquina).
 *
 *   3. npm run migrar
 *
 * O script e idempotente: preserva os IDs originais do Firestore e usa
 * ON CONFLICT DO NOTHING, entao rodar duas vezes nao duplica nada.
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

dotenv.config();

const SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-service-account.json"), "utf-8"));

initializeApp({
  credential: cert(SERVICE_ACCOUNT),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "deyrot-e4381.firebasestorage.app",
});

const fsdb = getFirestore();
const bucket = getStorage().bucket();

// O db.ts importa DATABASE_URL na carga, entao so pode entrar depois do dotenv.
const { pool, query, runMigrations } = await import("../server/db.js");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const stats = { arquivos: 0, erros: [] as string[] };

/** Cache url-do-firebase -> nova url /api/arquivos/<id>, evita baixar duas vezes. */
const cacheArquivos = new Map<string, string>();

/**
 * Baixa um arquivo do Firebase Storage e grava em `arquivos`.
 * Devolve a nova URL relativa. URLs que nao sao do Firebase passam intactas.
 */
async function migrarArquivo(url: string | undefined | null): Promise<string> {
  if (!url) return "";
  if (!/firebasestorage\.googleapis\.com|storage\.googleapis\.com/.test(url)) return url;
  if (cacheArquivos.has(url)) return cacheArquivos.get(url)!;

  try {
    // .../o/pasta%2Farquivo.pdf?alt=media  ->  pasta/arquivo.pdf
    const match = url.match(/\/o\/([^?]+)/);
    const caminho = match
      ? decodeURIComponent(match[1])
      : new URL(url).pathname.replace(/^\/[^/]+\//, "");

    const file = bucket.file(caminho);
    const [buffer] = await file.download();
    const [meta] = await file.getMetadata();

    const nome = caminho.split("/").pop() || "arquivo";
    const { rows } = await query<{ id: string }>(
      `INSERT INTO arquivos (nome, mime_type, tamanho, conteudo)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [nome, meta.contentType || "application/octet-stream", buffer.length, buffer]
    );

    const novaUrl = `/api/arquivos/${rows[0].id}`;
    cacheArquivos.set(url, novaUrl);
    stats.arquivos++;
    console.log(`   📎 ${nome} (${(buffer.length / 1024).toFixed(0)} KB) -> ${novaUrl}`);
    return novaUrl;
  } catch (e) {
    const msg = `Arquivo nao migrado (${url}): ${(e as Error).message}`;
    console.warn(`   ⚠️  ${msg}`);
    stats.erros.push(msg);
    // Mantem a URL antiga: melhor um link pro Firebase do que um campo vazio.
    return url;
  }
}

/** Converte Timestamp do Firestore / string ISO / Date para Date. */
function paraData(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  if (typeof v === "object" && v !== null && "_seconds" in v) {
    return new Date((v as { _seconds: number })._seconds * 1000);
  }
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

const txt = (v: unknown) => (v === undefined || v === null ? "" : String(v));

// ---------------------------------------------------------------------------
// Colecoes
// ---------------------------------------------------------------------------

async function migrarEventos() {
  console.log("\n📅 eventos");
  const snap = await fsdb.collection("eventos").get();

  for (const doc of snap.docs) {
    const d = doc.data();
    const imagemUrl = await migrarArquivo(d.imagemUrl);

    await query(
      `INSERT INTO eventos
         (id, slug, titulo, descricao, imagem_url, link, botoes,
          meta_inscricoes, inscricao_habilitada, link_formulario_externo, criado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,COALESCE($11, now()))
       ON CONFLICT (id) DO NOTHING`,
      [
        doc.id,
        d.slug || null,
        txt(d.titulo),
        txt(d.descricao),
        imagemUrl,
        txt(d.link),
        JSON.stringify(d.botoes ?? []),
        Number(d.metaInscricoes) || 0,
        d.inscricaoHabilitada !== false,
        txt(d.linkFormularioExterno),
        paraData(d.criadoEm),
      ]
    );
    console.log(`   ✓ ${d.titulo}`);
  }

  // Inscricoes: listDocuments() tambem devolve docs "fantasma" (pais deletados
  // que ainda tem subcolecao), entao nenhum lead se perde.
  console.log("\n📅 evento_inscricoes");
  let total = 0;
  for (const ref of await fsdb.collection("eventos").listDocuments()) {
    const existe = await query("SELECT 1 FROM eventos WHERE id = $1", [ref.id]);
    if (existe.rowCount === 0) {
      console.warn(`   ⚠️  evento ${ref.id} nao existe - inscricoes ignoradas`);
      continue;
    }

    const inscricoes = await ref.collection("dadospessoas").get();
    for (const doc of inscricoes.docs) {
      const d = doc.data();
      await query(
        `INSERT INTO evento_inscricoes
           (id, evento_id, evento_titulo, nome, ddi, whatsapp, email, cep, bairro, estado, cidade, criado_em)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,COALESCE($12, now()))
         ON CONFLICT (id) DO NOTHING`,
        [
          doc.id,
          ref.id,
          txt(d.eventoTitulo),
          txt(d.nome),
          txt(d.ddi),
          txt(d.whatsapp),
          txt(d.email),
          txt(d.cep),
          txt(d.bairro),
          txt(d.estado),
          txt(d.cidade),
          paraData(d.criadoEm ?? d.timestamp),
        ]
      );
      total++;
    }
  }
  console.log(`   ✓ ${total} inscricoes`);
}

async function migrarDenuncias() {
  console.log("\n📄 denuncias");
  const snap = await fsdb.collection("denuncias").get();
  const slugParaId = new Map<string, string>();

  for (const doc of snap.docs) {
    const d = doc.data();
    const pdfUrl = await migrarArquivo(d.pdfUrl);
    const imagemUrl = await migrarArquivo(d.imagemUrl);
    const est = d.estatisticas ?? {};
    const slug = d.slug || doc.id;

    slugParaId.set(slug, doc.id);
    slugParaId.set(doc.id, doc.id);

    await query(
      `INSERT INTO denuncias
         (id, slug, titulo, descricao, pdf_url, imagem_url, status, formulario_ativo,
          mensagem_whatsapp, visualizacoes, downloads, formulario_envios, secoes,
          criado_em, atualizado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,COALESCE($14, now()),COALESCE($15, now()))
       ON CONFLICT (id) DO NOTHING`,
      [
        doc.id,
        slug,
        txt(d.titulo),
        txt(d.descricao),
        pdfUrl,
        imagemUrl,
        txt(d.status) || "rascunho",
        d.formularioAtivo !== false,
        txt(d.mensagemWhatsapp),
        Number(est.visualizacoes) || 0,
        Number(est.downloads) || 0,
        Number(est.formularioEnvios) || 0,
        JSON.stringify(d.secoes ?? []),
        paraData(d.criadoEm),
        paraData(d.atualizadoEm ?? d.criadoEm),
      ]
    );
    console.log(`   ✓ ${d.titulo} (/${slug})`);
  }

  // O codigo antigo gravava leads em denuncias/{slug}/leads, e o slug nem sempre
  // e o document ID - por isso o mapa slug->id acima.
  console.log("\n📄 denuncia_leads");
  let total = 0;
  for (const ref of await fsdb.collection("denuncias").listDocuments()) {
    const leads = await ref.collection("leads").get();
    const denunciaId = slugParaId.get(ref.id) ?? null;

    if (leads.size > 0 && !denunciaId) {
      console.warn(`   ⚠️  ${leads.size} leads sob "${ref.id}" sem denuncia correspondente (mantidos sem vinculo)`);
    }

    for (const doc of leads.docs) {
      const d = doc.data();
      await query(
        `INSERT INTO denuncia_leads
           (id, denuncia_id, slug, titulo, nome, ddi, whatsapp, email, cidade, criado_em)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10, now()))
         ON CONFLICT (id) DO NOTHING`,
        [
          doc.id,
          denunciaId,
          txt(d.slug || ref.id),
          txt(d.titulo),
          txt(d.nome),
          txt(d.ddi),
          txt(d.whatsapp),
          txt(d.email),
          txt(d.cidade),
          paraData(d.timestamp ?? d.criadoEm),
        ]
      );
      total++;
    }
  }
  console.log(`   ✓ ${total} leads`);

  console.log("\n📄 denuncia_formulario_acessos");
  const forms = await fsdb.collection("denuncias_formulario").get();
  for (const doc of forms.docs) {
    const d = doc.data();
    await query(
      `INSERT INTO denuncia_formulario_acessos
         (id, nome, email, whatsapp, cidade, termos, ip, criado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8, now()))
       ON CONFLICT (id) DO NOTHING`,
      [
        doc.id,
        txt(d.nome),
        txt(d.email),
        txt(d.whatsapp),
        txt(d.cidade),
        Boolean(d.termos),
        txt(d.ip),
        paraData(d.timestamp ?? d.createdAt),
      ]
    );
  }
  console.log(`   ✓ ${forms.size} registros`);
}

async function migrarCampanhas() {
  console.log("\n📢 campanhas");
  const snap = await fsdb.collection("campanhas").get();

  for (const doc of snap.docs) {
    const d = doc.data();
    const imagemUrl = await migrarArquivo(d.imagemUrl);

    await query(
      `INSERT INTO campanhas
         (id, titulo, descricao, imagem_url, data_inicio, data_fim, status, inscricoes, criado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9, now()))
       ON CONFLICT (id) DO NOTHING`,
      [
        doc.id,
        txt(d.titulo),
        txt(d.descricao),
        imagemUrl,
        paraData(d.dataInicio),
        paraData(d.dataFim),
        txt(d.status) || "ativa",
        Number(d.inscricoes) || 0,
        paraData(d.criadoEm),
      ]
    );
    console.log(`   ✓ ${d.titulo}`);
  }
}

async function migrarVoluntarios() {
  console.log("\n🙋 voluntarios");
  const snap = await fsdb.collection("voluntarios").get();

  for (const doc of snap.docs) {
    const d = doc.data();
    await query(
      `INSERT INTO voluntarios
         (id, nome, ddi, whatsapp, email, cep, bairro, estado, cidade, especialidade, termos, criado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,COALESCE($12, now()))
       ON CONFLICT (id) DO NOTHING`,
      [
        doc.id,
        txt(d.nome),
        txt(d.ddi),
        txt(d.whatsapp),
        txt(d.email),
        txt(d.cep),
        txt(d.bairro),
        txt(d.estado),
        txt(d.cidade),
        txt(d.especialidade),
        Boolean(d.termos),
        paraData(d.timestamp ?? d.createdAt),
      ]
    );
  }
  console.log(`   ✓ ${snap.size} voluntarios`);
}

async function migrarAbaixoAssinado() {
  console.log("\n✍️  abaixo_assinado_assinaturas");
  const snap = await fsdb.collection("abaixo_assinado_assinaturas").get();

  for (const doc of snap.docs) {
    const d = doc.data();
    await query(
      `INSERT INTO abaixo_assinado_assinaturas
         (id, nome, email, ddi, whatsapp, cidade, estado, criado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8, now()))
       ON CONFLICT (id) DO NOTHING`,
      [
        doc.id,
        txt(d.nome),
        txt(d.email),
        txt(d.ddi),
        txt(d.whatsapp),
        txt(d.cidade),
        txt(d.estado),
        paraData(d.timestamp ?? d.criadoEm ?? d.createdAt),
      ]
    );
  }
  console.log(`   ✓ ${snap.size} assinaturas`);
}

// ---------------------------------------------------------------------------

async function main() {
  console.log("🚀 Migrando Firebase -> Postgres\n");

  await runMigrations();

  await migrarEventos();
  await migrarDenuncias();
  await migrarCampanhas();
  await migrarVoluntarios();
  await migrarAbaixoAssinado();

  console.log(`\n✅ Concluido. ${stats.arquivos} arquivos copiados para a tabela "arquivos".`);

  if (stats.erros.length > 0) {
    console.log(`\n⚠️  ${stats.erros.length} arquivo(s) nao migraram (a URL antiga do Firebase foi mantida):`);
    stats.erros.forEach((e) => console.log(`   - ${e}`));
  }

  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("\n❌ Falhou:", e);
  process.exit(1);
});
