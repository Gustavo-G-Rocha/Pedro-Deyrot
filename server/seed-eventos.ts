/**
 * Cadastra a agenda inicial na primeira subida do site.
 *
 * So roda quando a tabela `eventos` esta COMPLETAMENTE vazia. Depois disso quem
 * manda e o painel /admin/dashboard: apagar ou editar um evento por la nao faz
 * ele voltar nem ser sobrescrito no proximo deploy.
 *
 * ATENCAO: por isso mesmo, os flyers precisam estar em public/eventos ANTES do
 * primeiro deploy com este arquivo. Se os eventos forem criados sem imagem, o
 * seed nao conserta depois — a correcao teria que ser pelo /admin.
 */
import { query } from "./db.js";

interface EventoInicial {
  slug: string;
  titulo: string;
  descricao: string;
  /** Flyer em public/eventos (proporcao 4:5, que e a do card). */
  imagem: string;
  /**
   * A listagem e ORDER BY criado_em DESC, entao a data maior aparece primeiro.
   * Como Foz e no dia 5 e Cascavel no dia 6, Foz leva o horario mais alto para
   * o evento mais proximo ficar no topo.
   */
  data: string;
}

const INICIAIS: EventoInicial[] = [
  {
    slug: "foz-do-iguacu-05-09",
    titulo: "Eventos em Foz do Iguaçu",
    imagem: "/eventos/foz-do-iguacu-05-09.webp",
    data: "2026-09-03T12:00:00Z",
    descricao: `A chapa oficial do Renan, com Pedro Deyrot e Willian Rocha.

05/09 (Sábado)

📍 Praça do Mitre — 14:00 — Adesivaço + Panfletagem
Av. Jorge Schimmelpfeng - Centro

📍 Cartório Bar — 19:00 — Happy Hour
Rua Belarmino de Mendonça, 640 - Centro`,
  },
  {
    slug: "cascavel-06-09",
    titulo: "Eventos em Cascavel",
    imagem: "/eventos/cascavel-06-09.webp",
    data: "2026-09-03T11:00:00Z",
    descricao: `A chapa oficial do Renan, com Pedro Deyrot e Willian Rocha.

06/09 (Domingo)

📍 Praça da Bíblia — 10:00 — Adesivaço
Av. Brasil, s/n - Centro

📍 Lago Municipal — 15:00 — Panfletagem
Av. Rocha Pombo, 3000

📍 Yellow Burger — 19:00 — Happy Hour
R. Pio XII, 2749 - Centro`,
  },
];

export async function seedEventos() {
  const { rows } = await query<{ total: number }>(
    "SELECT count(*)::int AS total FROM eventos"
  );

  if (rows[0].total > 0) return; // ja tem agenda: nao encosta

  for (const e of INICIAIS) {
    await query(
      `INSERT INTO eventos
         (slug, titulo, descricao, imagem_url, inscricao_habilitada, meta_inscricoes, criado_em)
       VALUES ($1, $2, $3, $4, false, 0, $5)
       ON CONFLICT (slug) DO NOTHING`,
      [e.slug, e.titulo, e.descricao, e.imagem, e.data]
    );
  }

  console.log(`✅ [DB] ${INICIAIS.length} eventos cadastrados (agenda estava vazia)`);
}
