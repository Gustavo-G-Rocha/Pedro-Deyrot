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

  // O consentimento e a declaracao de idade sao checados aqui tambem, e nao so
  // no formulario: apoiar uma campanha e dado sensivel (LGPD art. 5, II), e sem
  // consentimento especifico (art. 11, I) o cadastro nao pode existir. Checagem
  // so no front cai com qualquer POST direto na API.
  if (!b.termos) {
    return res.status(400).json({
      error: "E preciso autorizar o tratamento dos dados para se cadastrar",
    });
  }

  if (!b.maiorIdade) {
    return res.status(400).json({
      error: "O cadastro e permitido apenas para maiores de 16 anos",
    });
  }

  const row = await queryOne<{ id: string }>(
    `INSERT INTO voluntarios
       (nome, ddi, whatsapp, email, cep, bairro, estado, cidade, especialidade,
        termos, maior_idade, comunicacoes, politica_versao, consentimento_em)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())
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
      Boolean(b.maiorIdade),
      Boolean(b.comunicacoes),
      b.versaoPolitica ?? "",
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
