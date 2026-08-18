/**
 * Cliente da API REST — substitui o Firestore/Storage/Auth do Firebase.
 * Tudo relativo ao proprio host, entao funciona igual em dev e no Railway.
 */

const TOKEN_KEY = "admin_token";

// ---------------------------------------------------------------------------
// Sessao do admin (substitui o Firebase Auth)
// ---------------------------------------------------------------------------

export const sessao = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  salvar(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  limpar() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = sessao.token;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`/api${caminho}`, { ...init, headers });

  // Token vencido: derruba a sessao para o guard das telas de admin reagir.
  if (res.status === 401 && token) sessao.limpar();

  if (!res.ok) {
    const corpo = await res.json().catch(() => ({}));
    throw new ApiError(res.status, corpo.error || `Erro ${res.status}`);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}

const get = <T>(c: string) => request<T>(c);
const post = <T>(c: string, body?: unknown) =>
  request<T>(c, { method: "POST", body: body ? JSON.stringify(body) : undefined });
const put = <T>(c: string, body: unknown) =>
  request<T>(c, { method: "PUT", body: JSON.stringify(body) });
const del = <T>(c: string) => request<T>(c, { method: "DELETE" });

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Botao {
  texto: string;
  link: string;
}

export interface Evento {
  id: string;
  slug: string | null;
  titulo: string;
  descricao: string;
  imagem_url: string;
  link: string;
  botoes: Botao[];
  meta_inscricoes: number;
  inscricao_habilitada: boolean;
  link_formulario_externo: string;
  criado_em: string;
  total_inscricoes?: number;
}

export interface Denuncia {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  pdf_url: string;
  imagem_url: string;
  status: string;
  formulario_ativo: boolean;
  mensagem_whatsapp: string;
  secoes: Array<{ titulo: string; conteudo: string }>;
  criado_em: string;
  atualizado_em: string;
  estatisticas: {
    visualizacoes: number;
    downloads: number;
    formularioEnvios: number;
  };
}

export interface Campanha {
  id: string;
  titulo: string;
  descricao: string;
  imagem_url: string;
  data_inicio: string | null;
  data_fim: string | null;
  status: "ativa" | "encerrada";
  inscricoes: number;
  criado_em: string;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const auth = {
  async login(email: string, senha: string) {
    const r = await post<{ token: string; admin: { id: string; email: string } }>(
      "/auth/login",
      { email, senha }
    );
    sessao.salvar(r.token);
    return r.admin;
  },

  /** Valida o token no servidor. Substitui o onAuthStateChanged. */
  async me() {
    if (!sessao.token) return null;
    try {
      const r = await get<{ admin: { id: string; email: string } }>("/auth/me");
      return r.admin;
    } catch {
      return null;
    }
  },

  logout() {
    sessao.limpar();
  },
};

export const arquivos = {
  /** Sobe um arquivo e devolve a URL para guardar no registro. */
  async upload(file: File): Promise<string> {
    const form = new FormData();
    form.append("arquivo", file);
    const r = await request<{ url: string }>("/arquivos", { method: "POST", body: form });
    return r.url;
  },

  /** Remove o arquivo apontado pela URL. Ignora URLs externas e falhas. */
  async remover(url: string | undefined | null) {
    const id = url?.match(/\/api\/arquivos\/([^/?#]+)/)?.[1];
    if (!id) return;
    await del(`/arquivos/${id}`).catch(() => {});
  },
};

export const eventos = {
  listar: () => get<Evento[]>("/eventos"),
  buscar: (slug: string) => get<Evento>(`/eventos/${encodeURIComponent(slug)}`),
  criar: (dados: object) => post<Evento>("/eventos", dados),
  atualizar: (id: string, dados: object) => put<Evento>(`/eventos/${id}`, dados),
  remover: (id: string) => del<{ success: boolean }>(`/eventos/${id}`),
  inscrever: (slug: string, dados: object) =>
    post<{ id: string; totalInscricoes: number }>(
      `/eventos/${encodeURIComponent(slug)}/inscricoes`,
      dados
    ),
  inscricoes: (id: string) => get<Record<string, unknown>[]>(`/eventos/${id}/inscricoes`),
};

export const denuncias = {
  listar: (status?: string) =>
    get<Denuncia[]>(`/denuncias${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  buscar: (slug: string) => get<Denuncia>(`/denuncias/${encodeURIComponent(slug)}`),
  criar: (dados: object) => post<Denuncia>("/denuncias", dados),
  atualizar: (id: string, dados: object) =>
    put<Denuncia>(`/denuncias/${id}`, dados),
  remover: (id: string) => del<{ success: boolean }>(`/denuncias/${id}`),
  leads: (id: string) => get<Record<string, unknown>[]>(`/denuncias/${id}/leads`),

  /** Incrementa contadores. Falha em silencio: e metrica, nao bloqueia o usuario. */
  registrarEstatistica: (
    slug: string,
    campos: { visualizacoes?: number; downloads?: number; formularioEnvios?: number }
  ) =>
    post(`/denuncias/${encodeURIComponent(slug)}/estatisticas`, campos).catch(() => {}),

  enviarLead: (slug: string, dados: object) =>
    post<{ id: string }>(`/denuncias/${encodeURIComponent(slug)}/leads`, dados),

  emailJaCadastrado: (email: string) =>
    get<{ existe: boolean }>(`/denuncias/formulario/existe?email=${encodeURIComponent(email)}`),

  registrarAcesso: (dados: object) =>
    post<{ id: string }>("/denuncias/formulario", dados),
};

export const campanhas = {
  listar: () => get<Campanha[]>("/campanhas"),
  criar: (dados: object) => post<Campanha>("/campanhas", dados),
  atualizar: (id: string, dados: object) =>
    put<Campanha>(`/campanhas/${id}`, dados),
  remover: (id: string) => del<{ success: boolean }>(`/campanhas/${id}`),
};

export const voluntarios = {
  criar: (dados: object) => post<{ id: string }>("/voluntarios", dados),
  listar: () => get<Record<string, unknown>[]>("/voluntarios"),
};
