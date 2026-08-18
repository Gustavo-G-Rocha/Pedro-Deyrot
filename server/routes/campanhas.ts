import { Router } from "express";
import { query, queryOne } from "../db.js";
import { exigirAdmin } from "../auth.js";

const router = Router();

/** GET /api/campanhas - lista publica */
router.get("/", async (_req, res) => {
  const { rows } = await query("SELECT * FROM campanhas ORDER BY criado_em DESC");
  res.json(rows);
});

/** POST /api/campanhas */
router.post("/", exigirAdmin, async (req, res) => {
  const b = req.body ?? {};

  if (!b.titulo) return res.status(400).json({ error: "Titulo e obrigatorio" });

  const campanha = await queryOne(
    `INSERT INTO campanhas (titulo, descricao, imagem_url, data_inicio, data_fim, status, inscricoes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      b.titulo,
      b.descricao ?? "",
      b.imagemUrl ?? "",
      b.dataInicio || null,
      b.dataFim || null,
      b.status ?? "ativa",
      b.inscricoes ?? 0,
    ]
  );

  res.status(201).json(campanha);
});

/** PUT /api/campanhas/:id */
router.put("/:id", exigirAdmin, async (req, res) => {
  const b = req.body ?? {};

  const campanha = await queryOne(
    `UPDATE campanhas SET
       titulo = $2, descricao = $3, imagem_url = $4,
       data_inicio = $5, data_fim = $6, status = $7
     WHERE id = $1 RETURNING *`,
    [
      req.params.id,
      b.titulo,
      b.descricao ?? "",
      b.imagemUrl ?? "",
      b.dataInicio || null,
      b.dataFim || null,
      b.status ?? "ativa",
    ]
  );

  if (!campanha) return res.status(404).json({ error: "Campanha nao encontrada" });
  res.json(campanha);
});

/** DELETE /api/campanhas/:id */
router.delete("/:id", exigirAdmin, async (req, res) => {
  await query("DELETE FROM campanhas WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

export default router;
