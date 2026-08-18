import { Router } from "express";
import { query, queryOne } from "../db.js";
import { exigirAdmin } from "../auth.js";

const router = Router();

/** POST /api/voluntarios - cadastro publico */
router.post("/", async (req, res) => {
  const b = req.body ?? {};

  if (!b.nome || !b.email) {
    return res.status(400).json({ error: "Nome e email sao obrigatorios" });
  }

  const row = await queryOne<{ id: string }>(
    `INSERT INTO voluntarios
       (nome, ddi, whatsapp, email, cep, bairro, estado, cidade, especialidade, termos)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      b.nome,
      b.ddi ?? "",
      b.whatsapp ?? "",
      b.email,
      b.cep ?? "",
      b.bairro ?? "",
      b.estado ?? "",
      b.cidade ?? "",
      b.especialidade ?? "",
      Boolean(b.termos),
    ]
  );

  res.status(201).json({ id: row!.id });
});

/** GET /api/voluntarios - listagem administrativa */
router.get("/", exigirAdmin, async (_req, res) => {
  const { rows } = await query("SELECT * FROM voluntarios ORDER BY criado_em DESC");
  res.json(rows);
});

export default router;
