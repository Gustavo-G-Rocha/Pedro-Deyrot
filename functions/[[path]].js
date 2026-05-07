// SPA Fallback Handler - Serve index.html para rotas não encontradas
export async function onRequest(context) {
  try {
    // Tenta servir o recurso solicitado
    const response = await context.next();
    
    // Se não for 404, retorna a resposta normal
    if (response.status !== 404) {
      return response;
    }
    
    // Se for 404 e não tiver extensão (não é um asset), serve index.html
    const url = new URL(context.request.url);
    if (!url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
      // Faz fetch do index.html
      const indexResponse = await fetch(new URL('/index.html', url.origin));
      return new Response(indexResponse.body, {
        status: 200,
        headers: indexResponse.headers
      });
    }
    
    // Se chegou aqui, retorna o 404 original
    return response;
  } catch (error) {
    return context.next();
  }
}
