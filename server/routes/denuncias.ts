import { Router } from "express";
import { query, queryOne } from "../db.js";
import { exigirAdmin } from "../auth.js";

const router = Router();

/** Monta o objeto no formato que o front ja espera (estatisticas aninhadas). */
function serializar(row: Record<string, unknown>) {
  const { visualizacoes, downloads, formulario_envios, ...resto } = row;
  return {
    ...resto,
    estatisticas: {
      visualizacoes: visualizacoes ?? 0,
      downloads: downloads ?? 0,
      formularioEnvios: formulario_envios ?? 0,
    },
  };
}

/** GET /api/denuncias?status=publicada - lista publica */
router.get("/", async (req, res) => {
  const status = req.query.status as string | undefined;

  const { rows } = status
    ? await query("SELECT * FROM denuncias WHERE status = $1 ORDER BY criado_em DESC", [status])
    : await query("SELECT * FROM denuncias ORDER BY criado_em DESC");

  res.json(rows.map(serializar));
});

/** GET /api/denuncias/:slug - aceita slug ou id */
router.get("/:slug", async (req, res) => {
  const denuncia = await queryOne(
    "SELECT * FROM denuncias WHERE slug = $1 OR id = $1 LIMIT 1",
    [req.params.slug]
  );

  if (!denuncia) return res.status(404).json({ error: "Denuncia nao encontrada" });
  res.json(serializar(denuncia));
});

/** POST /api/denuncias/:slug/estatisticas - incremento publico dos contadores */
router.post("/:slug/estatisticas", async (req, res) => {
  const { visualizacoes = 0, downloads = 0, formularioEnvios = 0 } = req.body ?? {};

  // Clamp: impede que alguem mande numeros arbitrarios pra inflar o contador.
  const inc = (v: unknown) => Math.min(Math.max(Number(v) || 0, 0), 1);

  const denuncia = await queryOne(
    `UPDATE denuncias SET
       visualizacoes     = visualizacoes + $2,
       downloads         = downloads + $3,
       formulario_envios = formulario_envios + $4
     WHERE slug = $1 OR id = $1
     RETURNING *`,
    [req.params.slug, inc(visualizacoes), inc(downloads), inc(formularioEnvios)]
  );

  if (!denuncia) return res.status(404).json({ error: "Denuncia nao encontrada" });
  res.json(serializar(denuncia));
});

/** POST /api/denuncias/:slug/leads - formulario publico de acesso ao dossie */
router.post("/:slug/leads", async (req, res) => {
  const denuncia = await queryOne<{ id: string; titulo: string; formulario_ativo: boolean }>(
    "SELECT id, titulo, formulario_ativo FROM denuncias WHERE slug = $1 OR id = $1 LIMIT 1",
    [req.params.slug]
  );

  if (!denuncia) return res.status(404).json({ error: "Denuncia nao encontrada" });

  const b = req.body ?? {};
  const lead = await queryOne<{ id: string }>(
    `INSERT INTO denuncia_leads (denuncia_id, slug, titulo, nome, ddi, whatsapp, email, cidade)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      denuncia.id,
      req.params.slug,
      denuncia.titulo,
      b.nome ?? "",
      b.ddi ?? "",
      b.whatsapp ?? "",
      b.email ?? "",
      b.cidade ?? "",
    ]
  );

  // O envio do formulario ja conta como uma visualizacao do dossie.
  await query(
    `UPDATE denuncias
        SET formulario_envios = formulario_envios + 1,
            visualizacoes = visualizacoes + 1
      WHERE id = $1`,
    [denuncia.id]
  );

  res.status(201).json({ id: lead!.id });
});

// --------------------------------------------------------------------------
// Formulario de acesso as denuncias (antiga colecao denuncias_formulario)
// --------------------------------------------------------------------------

/** GET /api/denuncias/formulario/existe?email=... */
router.get("/formulario/existe", async (req, res) => {
  const email = String(req.query.email ?? "").toLowerCase().trim();
  if (!email) return res.json({ existe: false });

  const row = await queryOne(
    "SELECT 1 FROM denuncia_formulario_acessos WHERE lower(email) = $1 LIMIT 1",
    [email]
  );
  res.json({ existe: Boolean(row) });
});

/** POST /api/denuncias/formulario */
router.post("/formulario", async (req, res) => {
  const b = req.body ?? {};

  // O IP vem do servidor - o cliente nao tem como forjar.
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.ip || "";

  const row = await queryOne<{ id: string }>(
    `INSERT INTO denuncia_formulario_acessos (nome, email, whatsapp, cidade, termos, ip)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [b.nome ?? "", b.email ?? "", b.whatsapp ?? "", b.cidade ?? "", Boolean(b.termos), ip]
  );

  res.status(201).json({ id: row!.id });
});

// --------------------------------------------------------------------------
// Rotas administrativas
// --------------------------------------------------------------------------

/** POST /api/denuncias */
router.post("/", exigirAdmin, async (req, res) => {
  const b = req.body ?? {};

  if (!b.titulo || !b.slug) {
    return res.status(400).json({ error: "Titulo e slug sao obrigatorios" });
  }

  const jaExiste = await queryOne("SELECT 1 FROM denuncias WHERE slug = $1", [b.slug]);
  if (jaExiste) return res.status(409).json({ error: "Ja existe uma denuncia com esse slug" });

  const denuncia = await queryOne(
    `INSERT INTO denuncias
       (slug, titulo, descricao, pdf_url, imagem_url, status, formulario_ativo, mensagem_whatsapp, secoes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      b.slug,
      b.titulo,
      b.descricao ?? "",
      b.pdfUrl ?? "",
      b.imagemUrl ?? "",
      b.status ?? "rascunho",
      b.formularioAtivo ?? true,
      b.mensagemWhatsapp ?? "",
      JSON.stringify(b.secoes ?? []),
    ]
  );

  res.status(201).json(serializar(denuncia!));
});

/** PUT /api/denuncias/:id - nao mexe nos contadores */
router.put("/:id", exigirAdmin, async (req, res) => {
  const b = req.body ?? {};

  const denuncia = await queryOne(
    `UPDATE denuncias SET
       slug = $2, titulo = $3, descricao = $4, pdf_url = $5,
       imagem_url = $6, status = $7, formulario_ativo = $8, mensagem_whatsapp = $9,
       secoes = $10, atualizado_em = now()
     WHERE id = $1
     RETURNING *`,
    [
      req.params.id,
      b.slug,
      b.titulo,
      b.descricao ?? "",
      b.pdfUrl ?? "",
      b.imagemUrl ?? "",
      b.status ?? "rascunho",
      b.formularioAtivo ?? true,
      b.mensagemWhatsapp ?? "",
      JSON.stringify(b.secoes ?? []),
    ]
  );

  if (!denuncia) return res.status(404).json({ error: "Denuncia nao encontrada" });
  res.json(serializar(denuncia));
});

/** DELETE /api/denuncias/:id - os leads caem junto via ON DELETE CASCADE */
router.delete("/:id", exigirAdmin, async (req, res) => {
  await query("DELETE FROM denuncias WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

/** GET /api/denuncias/:id/leads - lista os leads (admin) */
router.get("/:id/leads", exigirAdmin, async (req, res) => {
  const { rows } = await query(
    `SELECT l.* FROM denuncia_leads l
       JOIN denuncias d ON d.id = l.denuncia_id
      WHERE d.id = $1 OR d.slug = $1
      ORDER BY l.criado_em DESC`,
    [req.params.id]
  );
  res.json(rows);
});

export default router;
