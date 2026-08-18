import { Router } from "express";
import bcrypt from "bcryptjs";
import { queryOne } from "../db.js";
import { assinarToken, exigirAdmin } from "../auth.js";

const router = Router();

interface AdminRow {
  id: string;
  email: string;
  senha_hash: string;
}

/** POST /api/auth/login - substitui signInWithEmailAndPassword */
router.post("/login", async (req, res) => {
  const { email, senha } = req.body ?? {};

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha sao obrigatorios" });
  }

  const admin = await queryOne<AdminRow>(
    "SELECT id, email, senha_hash FROM admin_users WHERE email = $1",
    [String(email).toLowerCase().trim()]
  );

  // Mensagem generica de proposito: nao revela se o email existe.
  if (!admin || !(await bcrypt.compare(senha, admin.senha_hash))) {
    return res.status(401).json({ error: "Email ou senha invalidos" });
  }

  const payload = { id: admin.id, email: admin.email };
  res.json({ token: assinarToken(payload), admin: payload });
});

/** GET /api/auth/me - substitui auth.onAuthStateChanged */
router.get("/me", exigirAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
