import express from "express";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import os from "os";

// Carregar variáveis de ambiente antes de qualquer módulo que leia process.env
dotenv.config();

const { runMigrations } = await import("./server/db.js");
const { default: authRouter } = await import("./server/routes/auth.js");
const { default: arquivosRouter } = await import("./server/routes/arquivos.js");
const { default: eventosRouter } = await import("./server/routes/eventos.js");
const { default: denunciasRouter } = await import("./server/routes/denuncias.js");
const { default: campanhasRouter } = await import("./server/routes/campanhas.js");
const { default: voluntariosRouter } = await import("./server/routes/voluntarios.js");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let estadoMigracao: "pendente" | "ok" | "falhou" = "pendente";

async function startServer() {
  const app = express();
  // O Railway define a PORT; 3000 é o fallback local.
  const PORT = Number(process.env.PORT) || 3000;

  // Necessário para req.ip enxergar o IP real por trás do proxy do Railway.
  app.set("trust proxy", 1);

  // gzip em tudo que passa pelo Express. Sem isso o bundle ia cru: 478 KB em
  // vez de ~142 KB, o que pesa bastante em 4G.
  app.use(compression());

  // Limite generoso: o editor de denúncias manda descrições longas.
  app.use(express.json({ limit: "2mb" }));

  // As migrations rodam DEPOIS do listen (no fim desta função). Bloquear o
  // boot nelas fazia o healthcheck bater em porta fechada e o Railway só
  // dizer "never became healthy", escondendo o erro real do banco.

  // ---------------------------------------------------------------------
  // API (Postgres)
  // ---------------------------------------------------------------------
  app.use("/api/auth", authRouter);
  app.use("/api/arquivos", arquivosRouter);
  app.use("/api/eventos", eventosRouter);
  app.use("/api/denuncias", denunciasRouter);
  app.use("/api/campanhas", campanhasRouter);
  app.use("/api/voluntarios", voluntariosRouter);

  // Liveness check: responde 200 enquanto o processo estiver de pé, e conta
  // no corpo como esta o banco. Assim um deploy com banco quebrado sobe e da
  // pra ler o erro, em vez de morrer calado.
  app.get("/api/health", async (_req, res) => {
    const { query } = await import("./server/db.js");
    try {
      await query("SELECT 1");
      res.json({ ok: true, db: "up", migracao: estadoMigracao });
    } catch (e) {
      res.json({ ok: false, db: "down", erro: (e as Error).message });
    }
  });

  // ---------------------------------------------------------------------
  // Integrações existentes
  // ---------------------------------------------------------------------

  // Espelho dos formulários para a planilha do Google (opcional)
  app.post("/api/submit", async (req, res) => {
    try {
      const formData = req.body;
      const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

      console.log('📨 [API] Recebido formulário:', {
        email: formData.email,
        tipo: formData.tipo,
        nome: formData.nome
      });

      if (!webhookUrl) {
        console.warn("⚠️ [API] GOOGLE_SHEETS_WEBHOOK_URL não está configurada no .env");
        console.log("✅ [API] Retornando sucesso sem enviar para Google Sheets");
        return res.status(200).json({
          success: true,
          message: "Formulário recebido! (Aviso: Webhook não configurado)"
        });
      }

      console.log('📤 [API] Enviando para Google Sheets:');

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log('📨 [API] Resposta do webhook:', response.status, response.statusText);

      if (response.ok) {
        console.log('✅ [API] Enviado para Google Sheets com sucesso!');
        res.status(200).json({ success: true, message: "Informações enviadas com sucesso!" });
      } else {
        const errorText = await response.text();
        console.error("❌ [API] Erro no webhook:", response.status, errorText);
        res.status(500).json({ success: false, error: "Erro ao enviar para Google Sheets" });
      }
    } catch (error) {
      console.error("❌ [API] Erro no servidor:", error);
      res.status(500).json({ success: false, error: "Erro interno do servidor." });
    }
  });

  // Proxy API for PDF to bypass CORS
  app.get("/api/proxy-pdf", async (req, res) => {
    try {
      let url = req.query.url as string;
      if (!url) return res.status(400).send("Missing URL parameter");

      // Handle Google Drive links automatically
      if (url.includes('drive.google.com')) {
          const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
              url = `https://drive.google.com/uc?export=download&id=${match[1]}`;
          }
      }

      console.log('🔄 [API] Proxying PDF:', url);
      const response = await fetch(url);

      if (!response.ok) {
        console.error("❌ [API] Failed to fetch PDF:", response.status, response.statusText);
        return res.status(response.status).send("Failed to fetch PDF");
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/pdf");

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error) {
      console.error("❌ [API] PDF Proxy error:", error);
      res.status(500).send("Internal proxy error");
    }
  });

  // Erros dos handlers async (inclusive o limite de tamanho do multer)
  app.use((err: Error & { code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "Arquivo muito grande (máx. 50 MB)" });
    }
    console.error("❌ [API] Erro não tratado:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    // Os arquivos de /assets tem hash no nome, entao nunca mudam de conteudo:
    // pode cachear pra sempre. O resto (imagens, manifest) fica com um dia.
    app.use(
      express.static(distPath, {
        setHeaders(res, caminho) {
          if (caminho.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else if (!caminho.endsWith("index.html")) {
            res.setHeader("Cache-Control", "public, max-age=86400");
          }
        },
      })
    );

    app.get("*", (req, res) => {
      // O index.html nao pode ser cacheado: e ele que aponta para o bundle novo
      // depois de cada deploy.
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    const getNetworkIp = () => {
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]!) {
          if (iface.family === 'IPv4' && !iface.internal && !name.toLowerCase().includes('vpn')) {
            return iface.address;
          }
        }
      }
      return '192.168.x.x'; // Fallback
    };

    console.log(`\n🚀 Servidor rodando localmente: http://localhost:${PORT}`);
    console.log(`📱 Servidor rodando na rede: http://${getNetworkIp()}:${PORT}\n`);
  });

  // Aplica db/schema.sql e garante o admin inicial. Um erro aqui é logado e
  // exposto em /api/health, mas não derruba o processo: sem isso o Railway
  // reinicia em loop e o motivo real nunca aparece.
  try {
    await runMigrations();
    estadoMigracao = "ok";
  } catch (e) {
    estadoMigracao = "falhou";
    console.error("\n❌ [DB] Não foi possível preparar o banco:", (e as Error).message);
    console.error("   Confira DATABASE_URL nas variáveis do serviço do site.");
    console.error("   No Railway ela deve ser a referência ${{Postgres.DATABASE_URL}},");
    console.error("   digitada com as chaves duplas — não a URL colada à mão.\n");
  }
}

startServer();
