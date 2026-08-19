/**
 * Cria as denuncias no Postgres a partir dos PDFs que estao no seu computador.
 *
 * Sem dependencia externa: os metadados estao na tabela DENUNCIAS aqui embaixo e o
 * PDF vem de uma pasta local. O binario vai para a tabela `arquivos` e a
 * denuncia aponta para /api/arquivos/<id>, igual ao que o painel /admin faz
 * quando alguem sobe um arquivo pela mao.
 *
 *   1. DATABASE_URL no .env (Railway: servico Postgres > Variables >
 *      DATABASE_PUBLIC_URL, a que tem "proxy.rlwy.net"; a ".railway.internal"
 *      so funciona de dentro do Railway).
 *   2. npm run seed-denuncias              -> simulacao, nao grava nada
 *      npm run seed-denuncias -- --aplicar -> grava de verdade
 *
 * Outra pasta: npm run seed-denuncias -- --aplicar "C:/caminho/da/pasta"
 *
 * Idempotente: roda quantas vezes quiser. Se a denuncia ja existe, atualiza os
 * textos e o PDF, mas NUNCA zera os contadores de visualizacao/download.
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// O db.ts le DATABASE_URL na carga, entao so pode entrar depois do dotenv.
const { pool, query, queryOne, runMigrations } = await import("../server/db.js");

const PASTA_PADRAO = "C:/Users/prest/Downloads/dossie";

interface Denuncia {
  slug: string;
  titulo: string;
  descricao: string;
  /** Nome do PDF na pasta, sem o prefixo de timestamp e em minusculas. */
  arquivo: string;
  /** Data original da publicacao: e ela que define a ordem da listagem. */
  data: string;
  /** Imagem do card, servida da pasta public/ (opcional). */
  imagem?: string;
  /** Contadores iniciais, usados so quando a denuncia ainda nao existe. */
  visualizacoes: number;
  downloads: number;
  envios: number;
}

const DENUNCIAS: Denuncia[] = [
  {
    slug: "safadao", titulo: "DOSSIÊ SAFADÃO", descricao: "DOSSIÊ SAFADÃO",
    arquivo: "dossie_grupo_ws.pdf", data: "2026-05-09T17:49:53Z",
    imagem: "/safadao@2x.png", visualizacoes: 400, downloads: 115, envios: 106,
  },
  {
    slug: "master", titulo: "Master", descricao: "DOSSIÊ FELIPE CANÇADO VORCARO",
    arquivo: "master.pdf", data: "2026-05-09T18:32:40Z",
    visualizacoes: 261, downloads: 623, envios: 224,
  },
  {
    slug: "corno", titulo: "Dossiê Ciro e Lorena", descricao: "Dossiê Ciro e Lorena",
    arquivo: "dossie_caso_ciro_lorena.pdf", data: "2026-05-12T16:50:43Z",
    visualizacoes: 295, downloads: 49, envios: 212,
  },
  {
    slug: "audio", titulo: "Áudio Flávio Bolsonaro",
    descricao: "Comprovação da veracidade do Áudio Flávio Bolsonaro",
    arquivo: "audio.pdf", data: "2026-05-13T22:28:37Z",
    visualizacoes: 14, downloads: 3, envios: 10,
  },
  {
    slug: "uai", titulo: "Romeu Zema", descricao: "Romeu Zema",
    arquivo: "dossie_zema_vorcaro_master.pdf", data: "2026-05-14T17:46:41Z",
    visualizacoes: 202, downloads: 50, envios: 128,
  },
  {
    slug: "cascavel", titulo: "Dossiê Renato Silva Cascavel", descricao: "Dossiê Renato Silva Cascavel",
    arquivo: "dossie_cascavel_renato_silva.pdf", data: "2026-05-16T16:38:53Z",
    visualizacoes: 13, downloads: 4, envios: 10,
  },
  {
    slug: "orelha", titulo: "Orelha", descricao: "Caso cão orelha",
    arquivo: "dossie_orelha_master_v2.pdf", data: "2026-05-18T12:32:18Z",
    visualizacoes: 10, downloads: 1, envios: 9,
  },
  {
    slug: "bananinha", titulo: "Eduardo Bolsonaro", descricao: "Dossiê Eduardo Bolsonaro",
    arquivo: "dossie_bananinha.pdf", data: "2026-05-19T14:42:53Z",
    visualizacoes: 63, downloads: 15, envios: 44,
  },
  {
    slug: "pimentel", titulo: "Pimentel", descricao: "Pimentel e copel",
    arquivo: "dossie_copel_pimentel_final.pdf", data: "2026-05-21T19:12:13Z",
    visualizacoes: 12, downloads: 2, envios: 8,
  },
  {
    slug: "matinhos", titulo: "Matinhos", descricao: "Dossiê matinhos",
    arquivo: "dossie_matinhos.pdf", data: "2026-05-22T21:47:35Z",
    visualizacoes: 1, downloads: 0, envios: 1,
  },
];

/** "1779486451665_dossie_matinhos.pdf" -> "dossie_matinhos.pdf" */
function semTimestamp(nome: string): string {
  return nome.replace(/^\d{10,}_/, "").toLowerCase();
}

function tamanho(bytes: number): string {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}

async function main() {
  const args = process.argv.slice(2);
  const aplicar = args.includes("--aplicar");
  const pasta = args.find((a) => !a.startsWith("--")) ?? PASTA_PADRAO;

  console.log(`📄 PDFs em: ${pasta}`);
  console.log(aplicar ? "   modo: GRAVANDO no banco\n" : "   modo: simulação (use --aplicar para gravar)\n");

  if (!fs.existsSync(pasta)) throw new Error(`Pasta nao encontrada: ${pasta}`);

  await runMigrations();

  // Indexa a pasta pelo nome sem timestamp, para achar o PDF de cada denuncia.
  const naPasta = new Map<string, string>();
  for (const nome of fs.readdirSync(pasta)) {
    if (nome.toLowerCase().endsWith(".pdf")) naPasta.set(semTimestamp(nome), nome);
  }

  let criadas = 0;
  let atualizadas = 0;
  const semPdf: string[] = [];

  for (const d of DENUNCIAS) {
    const nomeArquivo = naPasta.get(d.arquivo);
    const existente = await queryOne<{ id: string; pdf_url: string }>(
      "SELECT id, pdf_url FROM denuncias WHERE slug = $1",
      [d.slug]
    );

    if (!nomeArquivo) {
      semPdf.push(`${d.titulo} (/${d.slug}) → falta ${d.arquivo}`);
      if (!existente) {
        console.log(`  ⏭️  ${d.titulo} (/${d.slug}) — sem PDF na pasta, pulando`);
        continue;
      }
      console.log(`  ⚠️  ${d.titulo} (/${d.slug}) — sem PDF na pasta, mantendo o que ja esta no banco`);
      continue;
    }

    const conteudo = fs.readFileSync(path.join(pasta, nomeArquivo));
    if (conteudo.subarray(0, 4).toString() !== "%PDF") {
      console.log(`  ⚠️  ${nomeArquivo} — nao parece um PDF valido, pulando`);
      continue;
    }

    // Mesmo arquivo ja anexado? Entao nao regrava o binario.
    let pdfUrl = existente?.pdf_url ?? "";
    let precisaSubir = true;
    if (pdfUrl.startsWith("/api/arquivos/")) {
      const atual = await queryOne<{ tamanho: number }>(
        "SELECT tamanho FROM arquivos WHERE id = $1",
        [pdfUrl.split("/").pop()!]
      );
      if (atual?.tamanho === conteudo.length) precisaSubir = false;
    }

    console.log(
      `  ${existente ? "↻" : "→"} ${d.titulo} (/${d.slug}) — ${nomeArquivo} (${tamanho(conteudo.length)})` +
        (precisaSubir ? "" : "  [PDF ja estava igual]")
    );

    if (!aplicar) {
      existente ? atualizadas++ : criadas++;
      continue;
    }

    if (precisaSubir) {
      const arquivo = await queryOne<{ id: string }>(
        `INSERT INTO arquivos (nome, mime_type, tamanho, conteudo)
         VALUES ($1, 'application/pdf', $2, $3) RETURNING id`,
        [nomeArquivo, conteudo.length, conteudo]
      );
      pdfUrl = `/api/arquivos/${arquivo!.id}`;
      console.log(`     📎 ${pdfUrl}`);
    }

    if (existente) {
      // Contadores ficam como estao: o site ja somou visitas depois da migracao.
      await query(
        `UPDATE denuncias
            SET titulo = $1, descricao = $2, pdf_url = $3, imagem_url = $4,
                status = 'publicado', criado_em = $5, atualizado_em = now()
          WHERE id = $6`,
        [d.titulo, d.descricao, pdfUrl, d.imagem ?? "", d.data, existente.id]
      );
      atualizadas++;
    } else {
      await query(
        `INSERT INTO denuncias
           (slug, titulo, descricao, pdf_url, imagem_url, status, formulario_ativo,
            visualizacoes, downloads, formulario_envios, criado_em, atualizado_em)
         VALUES ($1,$2,$3,$4,$5,'publicado',true,$6,$7,$8,$9,now())`,
        [d.slug, d.titulo, d.descricao, pdfUrl, d.imagem ?? "",
         d.visualizacoes, d.downloads, d.envios, d.data]
      );
      criadas++;
    }
  }

  // PDFs na pasta que nao pertencem a nenhuma denuncia do mapa.
  const usados = new Set(DENUNCIAS.map((d) => d.arquivo));
  const sobrando = [...naPasta.keys()].filter((k) => !usados.has(k));

  console.log(
    `\n${aplicar ? "✅" : "🔎"} ${criadas} criada(s) e ${atualizadas} atualizada(s)` +
      (aplicar ? "." : " (simulação).")
  );

  if (semPdf.length > 0) {
    console.log(`\n⚠️  ${semPdf.length} denúncia(s) sem PDF na pasta:`);
    semPdf.forEach((s) => console.log(`   - ${s}`));
  }
  if (sobrando.length > 0) {
    console.log(`\n⚠️  ${sobrando.length} PDF(s) na pasta sem denúncia correspondente:`);
    sobrando.forEach((s) => console.log(`   - ${naPasta.get(s)}`));
  }

  if (aplicar) {
    const { rows } = await query<{ total: number; publicadas: number; mb: string }>(
      `SELECT (SELECT count(*)::int FROM denuncias) AS total,
              (SELECT count(*)::int FROM denuncias WHERE status = 'publicado') AS publicadas,
              (SELECT COALESCE(pg_size_pretty(sum(tamanho)), '0 B') FROM arquivos) AS mb`
    );
    console.log(
      `   Banco agora: ${rows[0].total} denúncias (${rows[0].publicadas} publicadas), ${rows[0].mb} de arquivos.`
    );
  } else {
    console.log("\nNada foi gravado. Rode de novo com --aplicar para valer.");
  }
}

main()
  .catch((e) => {
    console.error("\n❌", (e as Error).message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
