import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET nao configurada. Gere uma com: openssl rand -hex 32");
}

const SECRET: string = JWT_SECRET;
const EXPIRES_IN = "7d";

export interface AdminPayload {
  id: string;
  email: string;
}

export function assinarToken(admin: AdminPayload): string {
  return jwt.sign(admin, SECRET, { expiresIn: EXPIRES_IN });
}

export function verificarToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

/** Bloqueia a rota se nao houver um Bearer token valido. */
export function exigirAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Nao autenticado" });
  }

  const admin = verificarToken(header.slice(7));
  if (!admin) {
    return res.status(401).json({ error: "Sessao expirada ou invalida" });
  }

  req.admin = admin;
  next();
}
