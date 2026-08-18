-- Schema do Pedro Deyrot (migrado do Firebase Firestore)
-- Aplicado automaticamente no boot do servidor (server/db.ts -> runMigrations)
-- IDs sao TEXT para preservar os document IDs originais do Firestore.

-- gen_random_uuid() e nativo desde o Postgres 13, entao nao precisa de pgcrypto
-- (e CREATE EXTENSION exigiria superusuario em parte dos provedores).

-- ---------------------------------------------------------------------------
-- Administradores (substitui o Firebase Auth)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email       TEXT UNIQUE NOT NULL,
    senha_hash  TEXT NOT NULL,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Arquivos (substitui o Firebase Storage) - PDFs e imagens guardados em bytea
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS arquivos (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome        TEXT NOT NULL,
    mime_type   TEXT NOT NULL,
    tamanho     INTEGER NOT NULL,
    conteudo    BYTEA NOT NULL,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Eventos (Firestore: colecao "eventos")
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
    id                       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug                     TEXT UNIQUE,
    titulo                   TEXT NOT NULL,
    descricao                TEXT NOT NULL DEFAULT '',
    imagem_url               TEXT NOT NULL DEFAULT '',
    link                     TEXT NOT NULL DEFAULT '',
    botoes                   JSONB NOT NULL DEFAULT '[]'::jsonb,
    meta_inscricoes          INTEGER NOT NULL DEFAULT 0,
    inscricao_habilitada     BOOLEAN NOT NULL DEFAULT true,
    link_formulario_externo  TEXT NOT NULL DEFAULT '',
    criado_em                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inscricoes de eventos (Firestore: subcolecao "eventos/{id}/dadospessoas")
CREATE TABLE IF NOT EXISTS evento_inscricoes (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    evento_id      TEXT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    evento_titulo  TEXT NOT NULL DEFAULT '',
    nome           TEXT NOT NULL DEFAULT '',
    ddi            TEXT NOT NULL DEFAULT '',
    whatsapp       TEXT NOT NULL DEFAULT '',
    email          TEXT NOT NULL DEFAULT '',
    cep            TEXT NOT NULL DEFAULT '',
    bairro         TEXT NOT NULL DEFAULT '',
    estado         TEXT NOT NULL DEFAULT '',
    cidade         TEXT NOT NULL DEFAULT '',
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_evento_inscricoes_evento ON evento_inscricoes (evento_id);

-- ---------------------------------------------------------------------------
-- Denuncias / dossies (Firestore: colecao "denuncias")
-- O mapa "estatisticas" virou colunas, para permitir UPDATE atomico.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS denuncias (
    id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug               TEXT UNIQUE NOT NULL,
    titulo             TEXT NOT NULL,
    descricao          TEXT NOT NULL DEFAULT '',
    pdf_url            TEXT NOT NULL DEFAULT '',
    imagem_url         TEXT NOT NULL DEFAULT '',
    status             TEXT NOT NULL DEFAULT 'rascunho',
    formulario_ativo   BOOLEAN NOT NULL DEFAULT true,
    mensagem_whatsapp  TEXT NOT NULL DEFAULT '',
    visualizacoes      INTEGER NOT NULL DEFAULT 0,
    downloads          INTEGER NOT NULL DEFAULT 0,
    formulario_envios  INTEGER NOT NULL DEFAULT 0,
    secoes             JSONB NOT NULL DEFAULT '[]'::jsonb,
    criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_denuncias_status ON denuncias (status);

-- Leads das denuncias (Firestore: subcolecao "denuncias/{slug}/leads")
CREATE TABLE IF NOT EXISTS denuncia_leads (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    denuncia_id  TEXT REFERENCES denuncias(id) ON DELETE CASCADE,
    slug         TEXT NOT NULL DEFAULT '',
    titulo       TEXT NOT NULL DEFAULT '',
    nome         TEXT NOT NULL DEFAULT '',
    ddi          TEXT NOT NULL DEFAULT '',
    whatsapp     TEXT NOT NULL DEFAULT '',
    email        TEXT NOT NULL DEFAULT '',
    cidade       TEXT NOT NULL DEFAULT '',
    criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_denuncia_leads_denuncia ON denuncia_leads (denuncia_id);

-- Formulario de acesso as denuncias (Firestore: colecao "denuncias_formulario")
CREATE TABLE IF NOT EXISTS denuncia_formulario_acessos (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome       TEXT NOT NULL DEFAULT '',
    email      TEXT NOT NULL DEFAULT '',
    whatsapp   TEXT NOT NULL DEFAULT '',
    cidade     TEXT NOT NULL DEFAULT '',
    termos     BOOLEAN NOT NULL DEFAULT false,
    ip         TEXT NOT NULL DEFAULT '',
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_denuncia_form_email ON denuncia_formulario_acessos (lower(email));

-- ---------------------------------------------------------------------------
-- Campanhas (Firestore: colecao "campanhas")
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campanhas (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    titulo       TEXT NOT NULL,
    descricao    TEXT NOT NULL DEFAULT '',
    imagem_url   TEXT NOT NULL DEFAULT '',
    data_inicio  TIMESTAMPTZ,
    data_fim     TIMESTAMPTZ,
    status       TEXT NOT NULL DEFAULT 'ativa',
    inscricoes   INTEGER NOT NULL DEFAULT 0,
    criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Voluntarios (Firestore: colecao "voluntarios")
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS voluntarios (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome           TEXT NOT NULL DEFAULT '',
    ddi            TEXT NOT NULL DEFAULT '',
    whatsapp       TEXT NOT NULL DEFAULT '',
    email          TEXT NOT NULL DEFAULT '',
    cep            TEXT NOT NULL DEFAULT '',
    bairro         TEXT NOT NULL DEFAULT '',
    estado         TEXT NOT NULL DEFAULT '',
    cidade         TEXT NOT NULL DEFAULT '',
    especialidade  TEXT NOT NULL DEFAULT '',
    termos         BOOLEAN NOT NULL DEFAULT false,
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Assinaturas do abaixo-assinado (Firestore: "abaixo_assinado_assinaturas")
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS abaixo_assinado_assinaturas (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome       TEXT NOT NULL DEFAULT '',
    email      TEXT NOT NULL DEFAULT '',
    ddi        TEXT NOT NULL DEFAULT '',
    whatsapp   TEXT NOT NULL DEFAULT '',
    cidade     TEXT NOT NULL DEFAULT '',
    estado     TEXT NOT NULL DEFAULT '',
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_abaixo_assinado_email ON abaixo_assinado_assinaturas (lower(email));
