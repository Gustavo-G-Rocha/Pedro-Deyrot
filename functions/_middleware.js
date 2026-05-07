// Middleware para SPA (Single Page Application)
// Serve index.html para todas as rotas que não são assets ou API

export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Se for uma rota de API, deixa o handler específico lidar
  if (url.pathname.startsWith('/api/')) {
    return context.next();
  }
  
  // Se for um asset (arquivo estático), tenta servir normalmente
  if (url.pathname.match(/\.\w+$/)) {
    return context.next();
  }
  
  // Para todas as outras rotas (páginas do React Router),
  // serve o index.html
  const response = await context.env.ASSETS.fetch(
    new URL('/index.html', context.request.url)
  );
  
  return new Response(response.body, {
    status: 200,
    headers: response.headers
  });
}
