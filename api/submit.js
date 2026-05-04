export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const formData = req.body;
      const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

      if (!webhookUrl) {
        console.warn("GOOGLE_SHEETS_WEBHOOK_URL is not defined.");
        return res.status(200).json({ 
          success: true, 
          message: "Form received! (Warning: Webhook not configured)" 
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
