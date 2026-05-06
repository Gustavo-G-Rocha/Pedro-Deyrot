// Cloudflare Pages Function
// Arquivo: /functions/api/submit.js

export async function onRequestPost(context) {
  try {
    const formData = await context.request.json();
    const webhookUrl = context.env.GOOGLE_SHEETS_WEBHOOK_URL;

    console.log('📨 Recebido formulário:', { email: formData.email, tipo: formData.tipo });

    if (!webhookUrl) {
      console.warn("⚠️ GOOGLE_SHEETS_WEBHOOK_URL não está configurada");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Formulário recebido! (Aviso: Webhook não configurado)" 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Enviar para Google Sheets
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      console.log('✅ Enviado para Google Sheets com sucesso');
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Informações enviadas com sucesso!" 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const errorText = await response.text();
      console.error("❌ Erro no webhook:", response.status, errorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Erro ao enviar para Google Sheets" 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Erro interno do servidor: " + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Tratar outros métodos HTTP
export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  
  return new Response(JSON.stringify({ 
    error: 'Method not allowed' 
  }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
