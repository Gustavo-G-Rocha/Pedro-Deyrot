/**
 * Cadastra as denuncias na primeira subida do site.
 *
 * So roda quando a tabela `denuncias` esta COMPLETAMENTE vazia. Depois disso o
 * conteudo passa a ser do painel /admin, e este arquivo nunca mais escreve nada
 * — apagar uma denuncia pelo painel nao faz ela voltar no proximo deploy.
 *
 * Os PDFs sao servidos da pasta public/documentos, entao nao ocupam espaco no
 * banco. Para publicar um dossie novo, use o /admin (o upload vai para a tabela
 * `arquivos`); esta lista aqui e so o ponto de partida.
 */
import { query } from "./db.js";

interface DenunciaInicial {
  slug: string;
  titulo: string;
  descricao: string;
  /** Arquivo em public/documentos. */
  pdf: string;
  /** Imagem do card, tambem servida da pasta public (opcional). */
  imagem?: string;
  /** Data original da publicacao: e ela que define a ordem da listagem. */
  data: string;
  visualizacoes: number;
  downloads: number;
  envios: number;
}

const INICIAIS: DenunciaInicial[] = [
  {
    slug: "safadao", titulo: "DOSSIÊ SAFADÃO", descricao: "DOSSIÊ SAFADÃO",
    pdf: "/documentos/safadao.pdf", imagem: "/safadao@2x.png",
    data: "2026-05-09T17:49:53Z", visualizacoes: 400, downloads: 115, envios: 106,
  },
  {
    slug: "master", titulo: "Master", descricao: "DOSSIÊ FELIPE CANÇADO VORCARO",
    pdf: "/documentos/master.pdf",
    data: "2026-05-09T18:32:40Z", visualizacoes: 261, downloads: 623, envios: 224,
  },
  {
    slug: "corno", titulo: "Dossiê Ciro e Lorena", descricao: "Dossiê Ciro e Lorena",
    pdf: "/documentos/corno.pdf",
    data: "2026-05-12T16:50:43Z", visualizacoes: 295, downloads: 49, envios: 212,
  },
  {
    slug: "audio", titulo: "Áudio Flávio Bolsonaro",
    descricao: "Comprovação da veracidade do Áudio Flávio Bolsonaro",
    pdf: "/documentos/audio.pdf",
    data: "2026-05-13T22:28:37Z", visualizacoes: 14, downloads: 3, envios: 10,
  },
  {
    slug: "uai", titulo: "Romeu Zema", descricao: "Romeu Zema",
    pdf: "/documentos/uai.pdf",
    data: "2026-05-14T17:46:41Z", visualizacoes: 202, downloads: 50, envios: 128,
  },
  {
    slug: "cascavel", titulo: "Dossiê Renato Silva Cascavel", descricao: "Dossiê Renato Silva Cascavel",
    pdf: "/documentos/cascavel.pdf",
    data: "2026-05-16T16:38:53Z", visualizacoes: 13, downloads: 4, envios: 10,
  },
  {
    slug: "orelha", titulo: "Orelha", descricao: "Caso cão orelha",
    pdf: "/documentos/orelha.pdf",
    data: "2026-05-18T12:32:18Z", visualizacoes: 10, downloads: 1, envios: 9,
  },
  {
    slug: "bananinha", titulo: "Eduardo Bolsonaro", descricao: "Dossiê Eduardo Bolsonaro",
    pdf: "/documentos/bananinha.pdf",
    data: "2026-05-19T14:42:53Z", visualizacoes: 63, downloads: 15, envios: 44,
  },
  {
    slug: "matinhos", titulo: "Matinhos", descricao: "Dossiê matinhos",
    pdf: "/documentos/matinhos.pdf",
    data: "2026-05-22T21:47:35Z", visualizacoes: 1, downloads: 0, envios: 1,
  },
];

export async function seedDenuncias() {
  const { rows } = await query<{ total: number }>(
    "SELECT count(*)::int AS total FROM denuncias"
  );

  if (rows[0].total > 0) return; // ja tem conteudo: nao encosta

  for (const d of INICIAIS) {
    await query(
      `INSERT INTO denuncias
         (slug, titulo, descricao, pdf_url, imagem_url, status, formulario_ativo,
          visualizacoes, downloads, formulario_envios, criado_em, atualizado_em)
       VALUES ($1,$2,$3,$4,$5,'publicado',true,$6,$7,$8,$9,now())
       ON CONFLICT (slug) DO NOTHING`,
      [d.slug, d.titulo, d.descricao, d.pdf, d.imagem ?? "",
       d.visualizacoes, d.downloads, d.envios, d.data]
    );
  }

  console.log(`✅ [DB] ${INICIAIS.length} denúncias cadastradas (banco estava vazio)`);
}
