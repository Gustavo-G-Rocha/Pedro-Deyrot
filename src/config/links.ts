// Links externos usados pelo site. Centralizados aqui para facilitar a troca.

/** Grupo oficial do WhatsApp da campanha. */
export const WHATSAPP_GRUPO = 'https://chat.whatsapp.com/LJxjfnqcAhsKcjcTc3ALz6?s=qt&p=a&mlu=4';

/**
 * Site/formulario para pedir material de campanha (adesivo, santinho, camiseta...).
 * Enquanto estiver vazio, o botao cai no grupo do WhatsApp.
 * Assim que o site estiver no ar, e so colar a URL aqui.
 */
export const MATERIAL_URL = '';

/** URL usada pelo botao "Pedir material" (com fallback para o grupo). */
export const materialHref = MATERIAL_URL || WHATSAPP_GRUPO;
