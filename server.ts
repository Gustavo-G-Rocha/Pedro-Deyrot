import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

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

      if (!webhookUrl) {
        console.warn("GOOGLE_SHEETS_WEBHOOK_URL is not defined. Data will not be sent to Google Sheets.");
        // We'll return success anyway for the demo, but log the warning
        return res.status(200).json({ 
          success: true, 
          message: "Form received! (Warning: Webhook not configured)", 
          data: formData 
        });
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        res.status(200).json({ success: true, message: "Informações enviadas com sucesso!" });
      } else {
        const errorText = await response.text();
        console.error("Webhook error:", errorText);
        res.status(500).json({ success: false, error: "Erro ao enviar para Google Sheets" });
      }
    } catch (error) {
      console.error("Submission error:", error);
      res.status(500).json({ success: false, error: "Erro interno do servidor" });
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
