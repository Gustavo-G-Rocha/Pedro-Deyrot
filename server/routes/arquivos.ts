import { Router } from "express";
import multer from "multer";
import { query, queryOne } from "../db.js";
import { exigirAdmin } from "../auth.js";

const router = Router();

// 50 MB. O maior dossie migrado tem 26 MB, entao um teto de 25 MB rejeitaria
// justamente um arquivo que ja existe no site.
export const LIMITE_ARQUIVO_BYTES = 50 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_ARQUIVO_BYTES },
});

/** Extrai o id de uma URL /api/arquivos/<id>. Retorna null para URLs externas. */
export function idDoArquivo(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/api\/arquivos\/([^/?#]+)/);
  return match ? match[1] : null;
}

/** POST /api/arquivos - substitui uploadBytes + getDownloadURL */
router.post("/", exigirAdmin, upload.single("arquivo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  const { originalname, mimetype, size, buffer } = req.file;

  const row = await queryOne<{ id: string }>(
    `INSERT INTO arquivos (nome, mime_type, tamanho, conteudo)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [originalname, mimetype, size, buffer]
  );

  res.status(201).json({ id: row!.id, url: `/api/arquivos/${row!.id}`, nome: originalname });
});

/** GET /api/arquivos/:id - serve o binario */
router.get("/:id", async (req, res) => {
  const arquivo = await queryOne<{
    nome: string;
    mime_type: string;
    conteudo: Buffer;
  }>("SELECT nome, mime_type, conteudo FROM arquivos WHERE id = $1", [req.params.id]);

  if (!arquivo) {
    return res.status(404).json({ error: "Arquivo nao encontrado" });
  }

  res.setHeader("Content-Type", arquivo.mime_type);
  res.setHeader("Content-Length", arquivo.conteudo.length);
  // O conteudo de um id nunca muda, entao pode cachear pra sempre.
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(arquivo.nome)}"`);
  // res.end em vez de res.send: o send anexaria "; charset=utf-8" ao
  // Content-Type, o que nao faz sentido para PDF/imagem.
  res.end(arquivo.conteudo);
});

/** DELETE /api/arquivos/:id - substitui deleteObject */
router.delete("/:id", exigirAdmin, async (req, res) => {
  await query("DELETE FROM arquivos WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

export default router;
