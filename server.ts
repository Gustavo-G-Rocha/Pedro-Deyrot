import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Form Submission
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
      res.status(500).json({ success: false, error: "Erro interno do servidor: " + error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
