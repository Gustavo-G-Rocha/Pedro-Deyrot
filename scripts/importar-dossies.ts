/**
 * Anexa os PDFs dos dossies (arquivos locais) as denuncias do site.
 *
 * Diferente do importar-denuncias.ts, este NAO fala com o Firebase: le os PDFs
 * de uma pasta do seu computador, grava o binario na tabela `arquivos` e aponta
 * `denuncias.pdf_url` para /api/arquivos/<id>.
 *
 *   1. DATABASE_URL no .env (Railway: servico Postgres > Variables >
 *      DATABASE_PUBLIC_URL, para rodar da sua maquina).
 *   2. npm run importar-dossies              -> simulacao, nao grava nada
 *      npm run importar-dossies -- --aplicar -> grava de verdade
 *
 * Outra pasta: npm run importar-dossies -- --aplicar "C:/caminho/da/pasta"
 *
 * Idempotente: um PDF ja anexado (mesmo nome e mesmo tamanho) e pulado, entao
 * rodar duas vezes nao duplica arquivo nem estoura o banco.
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// O db.ts le DATABASE_URL na carga, entao so pode entrar depois do dotenv.
const { pool, query, queryOne, runMigrations } = await import("../server/db.js");

const PASTA_PADRAO = "C:/Users/prest/Downloads/dossie";

/**
 * De qual denuncia e cada PDF. A chave e o nome do arquivo SEM o prefixo de
 * timestamp e em minusculas; `data` e a data original da publicacao (a mesma
 * que estava no site antigo), usada para manter a ordem da listagem.
 *
 * Para incluir um dossie novo, acrescente uma linha aqui.
 */
const DOSSIES: Array<{ arquivo: string; slug: string; titulo: string; data: string }> = [
  { arquivo: "dossie_grupo_ws.pdf",                slug: "safadao",   titulo: "DOSSIÊ SAFADÃO",               data: "2026-05-09T18:29:38Z" },
  { arquivo: "master.pdf",                         slug: "master",    titulo: "Master",                       data: "2026-05-09T18:32:32Z" },
  { arquivo: "dossie_caso_ciro_lorena.pdf",        slug: "corno",     titulo: "Dossiê Ciro e Lorena",         data: "2026-05-12T16:50:39Z" },
  { arquivo: "audio.pdf",                          slug: "audio",     titulo: "Áudio Flávio Bolsonaro",       data: "2026-05-13T22:28:22Z" },
  { arquivo: "dossie_zema_vorcaro_master.pdf",     slug: "uai",       titulo: "Romeu Zema",                   data: "2026-05-14T17:46:32Z" },
  { arquivo: "dossie_cascavel_renato_silva.pdf",   slug: "cascavel",  titulo: "Dossiê Renato Silva Cascavel", data: "2026-05-16T16:38:50Z" },
  { arquivo: "dossie_orelha_master_v2.pdf",        slug: "orelha",    titulo: "Orelha",                       data: "2026-05-18T12:32:16Z" },
  { arquivo: "dossie_bananinha.pdf",               slug: "bananinha", titulo: "Eduardo Bolsonaro",            data: "2026-05-19T14:42:49Z" },
  { arquivo: "dossie_copel_pimentel_final.pdf",    slug: "pimentel",  titulo: "Pimentel",                     data: "2026-05-21T17:52:07Z" },
  { arquivo: "dossie_matinhos.pdf",                slug: "matinhos",  titulo: "Matinhos",                     data: "2026-05-22T21:47:31Z" },
];

/** "1779486451665_dossie_matinhos.pdf" -> "dossie_matinhos.pdf" */
function semTimestamp(nome: string): string {
  return nome.replace(/^\d{10,}_/, "").toLowerCase();
}

function formatarTamanho(bytes: number): string {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}

async function main() {
  const args = process.argv.slice(2);
  const aplicar = args.includes("--aplicar");
  const pasta = args.find((a) => !a.startsWith("--")) ?? PASTA_PADRAO;

  console.log(`📄 Dossiês de: ${pasta}`);
  console.log(aplicar ? "   modo: GRAVANDO no banco\n" : "   modo: simulação (use --aplicar para gravar)\n");

  if (!fs.existsSync(pasta)) {
    throw new Error(`Pasta nao encontrada: ${pasta}`);
  }

  await runMigrations();

  const pdfs = fs
    .readdirSync(pasta)
    .filter((n) => n.toLowerCase().endsWith(".pdf"))
    .sort(); // o prefixo de timestamp ja ordena por data de publicacao

  console.log(`Encontrados ${pdfs.length} PDF(s) na pasta.\n`);

  let anexados = 0;
  let pulados = 0;
  const semDono: string[] = [];

  for (const nomeArquivo of pdfs) {
    const chave = semTimestamp(nomeArquivo);
    const dossie = DOSSIES.find((d) => d.arquivo === chave);

    if (!dossie) {
      console.log(`  ❓ ${nomeArquivo} — nao sei de qual denuncia e (adicione em DOSSIES)`);
      semDono.push(nomeArquivo);
      continue;
    }

    const caminho = path.join(pasta, nomeArquivo);
    const conteudo = fs.readFileSync(caminho);

    if (conteudo.subarray(0, 4).toString() !== "%PDF") {
      console.log(`  ⚠️  ${nomeArquivo} — nao parece um PDF valido, pulando`);
      pulados++;
      continue;
    }

    const denuncia = await queryOne<{ id: string; titulo: string; pdf_url: string }>(
      "SELECT id, titulo, pdf_url FROM denuncias WHERE slug = $1",
      [dossie.slug]
    );

    // Ja tem esse mesmo arquivo anexado? Entao nao precisa regravar o binario.
    if (denuncia?.pdf_url?.startsWith("/api/arquivos/")) {
      const idArquivo = denuncia.pdf_url.split("/").pop()!;
      const atual = await queryOne<{ nome: string; tamanho: number }>(
        "SELECT nome, tamanho FROM arquivos WHERE id = $1",
        [idArquivo]
      );
      if (atual && atual.tamanho === conteudo.length) {
        console.log(`  ⏭️  ${dossie.titulo} (/${dossie.slug}) — ja estava anexado`);
        pulados++;
        continue;
      }
    }

    console.log(
      `  → ${dossie.titulo} (/${dossie.slug}) — ${nomeArquivo} (${formatarTamanho(conteudo.length)})` +
        (denuncia ? "" : "  [denuncia nao existe: sera criada]")
    );

    if (!aplicar) {
      anexados++;
      continue;
    }

    const arquivo = await queryOne<{ id: string }>(
      `INSERT INTO arquivos (nome, mime_type, tamanho, conteudo)
       VALUES ($1, 'application/pdf', $2, $3) RETURNING id`,
      [nomeArquivo, conteudo.length, conteudo]
    );
    const url = `/api/arquivos/${arquivo!.id}`;

    if (denuncia) {
      // So o PDF e a data: titulo, descricao e secoes ficam como estao.
      await query(
        `UPDATE denuncias
            SET pdf_url = $1, criado_em = $2, atualizado_em = now()
          WHERE id = $3`,
        [url, dossie.data, denuncia.id]
      );
    } else {
      await query(
        `INSERT INTO denuncias (slug, titulo, pdf_url, status, criado_em, atualizado_em)
         VALUES ($1, $2, $3, 'publicado', $4, now())`,
        [dossie.slug, dossie.titulo, url, dossie.data]
      );
    }

    console.log(`     📎 ${url}`);
    anexados++;
  }

  // Dossies do mapa que nao tinham arquivo na pasta.
  const chavesNaPasta = new Set(pdfs.map(semTimestamp));
  const faltando = DOSSIES.filter((d) => !chavesNaPasta.has(d.arquivo));

  console.log(
    `\n${aplicar ? "✅" : "🔎"} ${anexados} dossiê(s) ${aplicar ? "anexado(s)" : "seriam anexados"}, ${pulados} pulado(s).`
  );

  if (faltando.length > 0) {
    console.log(`\n⚠️  ${faltando.length} dossiê(s) do mapa sem arquivo na pasta:`);
    faltando.forEach((d) => console.log(`   - ${d.titulo} (/${d.slug}) → falta ${d.arquivo}`));
  }

  if (semDono.length > 0) {
    console.log(`\n⚠️  ${semDono.length} PDF(s) na pasta sem denuncia correspondente:`);
    semDono.forEach((n) => console.log(`   - ${n}`));
  }

  if (!aplicar) {
    console.log("\nNada foi gravado. Rode de novo com --aplicar para valer.");
  }
}

main()
  .catch((e) => {
    console.error("\n❌", (e as Error).message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
