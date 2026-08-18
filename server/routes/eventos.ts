import { Router } from "express";
import { query, queryOne } from "../db.js";
import { exigirAdmin } from "../auth.js";

const router = Router();

const CAMPOS_PUBLICOS = `
    id, slug, titulo, descricao, imagem_url, link, botoes,
    meta_inscricoes, inscricao_habilitada, link_formulario_externo, criado_em`;

/** GET /api/eventos - lista publica, com a contagem de inscricoes ja agregada */
router.get("/", async (_req, res) => {
  const { rows } = await query(
    `SELECT ${CAMPOS_PUBLICOS},
            (SELECT count(*)::int FROM evento_inscricoes i WHERE i.evento_id = e.id) AS total_inscricoes
       FROM eventos e
      ORDER BY criado_em DESC`
  );
  res.json(rows);
});

/** GET /api/eventos/:slug - busca por slug e cai pro id (eventos antigos sem slug) */
router.get("/:slug", async (req, res) => {
  const evento = await queryOne(
    `SELECT ${CAMPOS_PUBLICOS},
            (SELECT count(*)::int FROM evento_inscricoes i WHERE i.evento_id = e.id) AS total_inscricoes
       FROM eventos e
      WHERE slug = $1 OR id = $1
      LIMIT 1`,
    [req.params.slug]
  );

  if (!evento) return res.status(404).json({ error: "Evento nao encontrado" });
  res.json(evento);
});

/** POST /api/eventos/:id/inscricoes - formulario publico */
router.post("/:id/inscricoes", async (req, res) => {
  const evento = await queryOne<{ id: string; titulo: string; inscricao_habilitada: boolean }>(
    "SELECT id, titulo, inscricao_habilitada FROM eventos WHERE slug = $1 OR id = $1 LIMIT 1",
    [req.params.id]
  );

  if (!evento) return res.status(404).json({ error: "Evento nao encontrado" });
  if (!evento.inscricao_habilitada) {
    return res.status(403).json({ error: "As inscricoes deste evento estao encerradas" });
  }

  const b = req.body ?? {};
  const inscricao = await queryOne<{ id: string }>(
    `INSERT INTO evento_inscricoes
       (evento_id, evento_titulo, nome, ddi, whatsapp, email, cep, bairro, estado, cidade)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      evento.id,
      evento.titulo,
      b.nome ?? "",
      b.ddi ?? "",
      b.whatsapp ?? "",
      b.email ?? "",
      b.cep ?? "",
      b.bairro ?? "",
      b.estado ?? "",
      b.cidade ?? "",
    ]
  );

  const { rows } = await query<{ total: number }>(
    "SELECT count(*)::int AS total FROM evento_inscricoes WHERE evento_id = $1",
    [evento.id]
  );

  res.status(201).json({ id: inscricao!.id, totalInscricoes: rows[0].total });
});

// --------------------------------------------------------------------------
// Rotas administrativas
// --------------------------------------------------------------------------

/** POST /api/eventos */
router.post("/", exigirAdmin, async (req, res) => {
  const b = req.body ?? {};

  if (!b.titulo) return res.status(400).json({ error: "Titulo e obrigatorio" });

  const evento = await queryOne(
    `INSERT INTO eventos
       (slug, titulo, descricao, imagem_url, link, botoes,
        meta_inscricoes, inscricao_habilitada, link_formulario_externo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING ${CAMPOS_PUBLICOS}`,
    [
      b.slug || null,
      b.titulo,
      b.descricao ?? "",
      b.imagemUrl ?? "",
      b.link ?? "",
      JSON.stringify(b.botoes ?? []),
      b.metaInscricoes ?? 0,
      b.inscricaoHabilitada ?? true,
      b.linkFormularioExterno ?? "",
    ]
  );

  res.status(201).json(evento);
});

/** PUT /api/eventos/:id */
router.put("/:id", exigirAdmin, async (req, res) => {
  const b = req.body ?? {};

  const evento = await queryOne(
    `UPDATE eventos SET
       slug = $2, titulo = $3, descricao = $4, imagem_url = $5, link = $6, botoes = $7,
       meta_inscricoes = $8, inscricao_habilitada = $9, link_formulario_externo = $10
     WHERE id = $1
     RETURNING ${CAMPOS_PUBLICOS}`,
    [
      req.params.id,
      b.slug || null,
      b.titulo,
      b.descricao ?? "",
      b.imagemUrl ?? "",
      b.link ?? "",
      JSON.stringify(b.botoes ?? []),
      b.metaInscricoes ?? 0,
      b.inscricaoHabilitada ?? true,
      b.linkFormularioExterno ?? "",
    ]
  );

  if (!evento) return res.status(404).json({ error: "Evento nao encontrado" });
  res.json(evento);
});

/** DELETE /api/eventos/:id - as inscricoes caem junto via ON DELETE CASCADE */
router.delete("/:id", exigirAdmin, async (req, res) => {
  await query("DELETE FROM eventos WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

/** GET /api/eventos/:id/inscricoes - lista os leads (admin) */
router.get("/:id/inscricoes", exigirAdmin, async (req, res) => {
  const { rows } = await query(
    "SELECT * FROM evento_inscricoes WHERE evento_id = $1 ORDER BY criado_em DESC",
    [req.params.id]
  );
  res.json(rows);
});

export default router;
