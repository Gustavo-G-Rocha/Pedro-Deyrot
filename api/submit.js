export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const formData = req.body;
      const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

      console.log('📥 Recebendo dados do formulário:', {
        tipo: formData.tipo,
        nomeEvento: formData.nomeEvento,
        nome: formData.nome
      });

      if (!webhookUrl) {
        console.warn("GOOGLE_SHEETS_WEBHOOK_URL is not defined.");
        return res.status(200).json({ 
          success: true, 
          message: "Form received! (Warning: Webhook not configured)" 
        });
      }

      console.log('🔗 Enviando para webhook:', webhookUrl.substring(0, 50) + '...');

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Resposta do webhook:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Resposta JSON:', responseData);
        res.status(200).json({ success: true, message: "Informações enviadas com sucesso!" });
      } else {
        const errorText = await response.text();
        console.error("❌ Webhook error:", errorText);
        res.status(500).json({ 
          success: false, 
          error: "Erro ao enviar para Google Sheets",
          details: errorText.substring(0, 200) // Primeiros 200 caracteres do erro
        });
      }
    } catch (error) {
      console.error("❌ Submission error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
