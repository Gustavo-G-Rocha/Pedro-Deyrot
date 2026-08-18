# Prompt para inserir dados no banco

Copie tudo abaixo da linha e cole numa conversa nova com o Claude, junto com os dados
que você quer cadastrar (planilha, lista, texto solto — tanto faz).

---

Estou trabalhando no site **Pedro Deyrot**: React + Vite no front, Express + Postgres no
back, hospedado no Railway. Preciso inserir dados no banco.

## Como conectar

A `DATABASE_URL` está na aba **Variables** do serviço Postgres no Railway (use o valor de
`DATABASE_PUBLIC_URL` para conectar de fora). O projeto já tem o driver `pg` instalado e
um helper pronto em `server/db.ts` que exporta `query(sql, params)` e `pool`.

Para rodar um script de inserção:

```bash
npx tsx meu-script.ts
```

O `server/db.ts` lê `DATABASE_URL` do `.env` na raiz do projeto.

## Regras que valem para todas as tabelas

- **Todos os `id` são `TEXT`**, não UUID nativo. Têm default `gen_random_uuid()::text`, então
  **omita o `id` no INSERT** e deixe o banco gerar — a menos que você precise de um id específico.
- **Datas são `TIMESTAMPTZ`.** Passe `Date` do JS ou string ISO. Os campos `criado_em` têm
  default `now()`, então normalmente pode omitir.
- **Nunca concatene valor em SQL.** Use sempre parâmetros posicionais (`$1`, `$2`, ...) —
  o helper `query()` já recebe o array de params.
- **Colunas `TEXT NOT NULL DEFAULT ''`** aceitam string vazia, mas não `null`. Se o dado de
  origem vier vazio, mande `''`.
- **Colunas `JSONB`** (`botoes`, `secoes`) esperam uma string JSON: use `JSON.stringify(valor)`.
- Para inserções em lote e reexecutáveis, use `ON CONFLICT DO NOTHING`.

## Como funcionam os arquivos (PDFs e imagens)

**Não existe pasta de uploads nem bucket.** Os arquivos ficam como `BYTEA` dentro da tabela
`arquivos`, e as outras tabelas guardam apenas a URL relativa `/api/arquivos/<id>`.

Para inserir um arquivo:

```ts
const buffer = fs.readFileSync('dossie.pdf');
const { rows } = await query(
  `INSERT INTO arquivos (nome, mime_type, tamanho, conteudo)
   VALUES ($1, $2, $3, $4) RETURNING id`,
  ['dossie.pdf', 'application/pdf', buffer.length, buffer]
);
const url = `/api/arquivos/${rows[0].id}`;   // é isso que vai em pdf_url / imagem_url
```

Limite de 25 MB por arquivo.

## O schema completo

```sql
-- Administradores do painel /admin.
-- senha_hash é bcrypt (use bcryptjs, salt 10). Nunca guarde senha em texto puro.
CREATE TABLE admin_users (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email       TEXT UNIQUE NOT NULL,
    senha_hash  TEXT NOT NULL,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PDFs e imagens. Referenciados por /api/arquivos/<id> nas demais tabelas.
CREATE TABLE arquivos (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome        TEXT NOT NULL,
    mime_type   TEXT NOT NULL,          -- ex: 'application/pdf', 'image/jpeg'
    tamanho     INTEGER NOT NULL,       -- bytes
    conteudo    BYTEA NOT NULL,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eventos exibidos em /eventos e /evento/:slug
CREATE TABLE eventos (
    id                       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug                     TEXT UNIQUE,           -- vira a URL /evento/<slug>
    titulo                   TEXT NOT NULL,
    descricao                TEXT NOT NULL DEFAULT '',
    imagem_url               TEXT NOT NULL DEFAULT '',   -- /api/arquivos/<id>
    link                     TEXT NOT NULL DEFAULT '',
    botoes                   JSONB NOT NULL DEFAULT '[]'::jsonb,
        -- formato: [{"texto": "Inscreva-se", "link": "https://..."}]
    meta_inscricoes          INTEGER NOT NULL DEFAULT 0,  -- 0 = sem meta/barra de progresso
    inscricao_habilitada     BOOLEAN NOT NULL DEFAULT true,
        -- false = usa o link_formulario_externo em vez do formulário interno
    link_formulario_externo  TEXT NOT NULL DEFAULT '',
    criado_em                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inscrições feitas no formulário público de um evento
CREATE TABLE evento_inscricoes (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    evento_id      TEXT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    evento_titulo  TEXT NOT NULL DEFAULT '',   -- desnormalizado, facilita exportar
    nome           TEXT NOT NULL DEFAULT '',
    ddi            TEXT NOT NULL DEFAULT '',   -- ex: '+55'
    whatsapp       TEXT NOT NULL DEFAULT '',
    email          TEXT NOT NULL DEFAULT '',
    cep            TEXT NOT NULL DEFAULT '',
    bairro         TEXT NOT NULL DEFAULT '',
    estado         TEXT NOT NULL DEFAULT '',   -- sigla, ex: 'PR'
    cidade         TEXT NOT NULL DEFAULT '',
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dossiês de denúncia, exibidos em /denuncias e /denuncias/:slug
CREATE TABLE denuncias (
    id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug               TEXT UNIQUE NOT NULL,       -- vira a URL /denuncias/<slug>
    titulo             TEXT NOT NULL,
    descricao          TEXT NOT NULL DEFAULT '',
    pdf_url            TEXT NOT NULL DEFAULT '',   -- /api/arquivos/<id>
    imagem_url         TEXT NOT NULL DEFAULT '',   -- capa, /api/arquivos/<id>
    status             TEXT NOT NULL DEFAULT 'rascunho',
        -- IMPORTANTE: só 'publicado' aparece no site. O outro valor é 'rascunho'.
    formulario_ativo   BOOLEAN NOT NULL DEFAULT true,
        -- true = exige preencher o formulário antes de ver o dossiê
    mensagem_whatsapp  TEXT NOT NULL DEFAULT '',   -- texto pré-preenchido no WhatsApp
    visualizacoes      INTEGER NOT NULL DEFAULT 0,
    downloads          INTEGER NOT NULL DEFAULT 0,
    formulario_envios  INTEGER NOT NULL DEFAULT 0,
    secoes             JSONB NOT NULL DEFAULT '[]'::jsonb,
        -- formato: [{"titulo": "...", "conteudo": "..."}]  (campo legado)
    criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leads capturados no formulário de acesso de uma denúncia
CREATE TABLE denuncia_leads (
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

-- Registro geral de quem preencheu o formulário de acesso às denúncias
CREATE TABLE denuncia_formulario_acessos (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome       TEXT NOT NULL DEFAULT '',
    email      TEXT NOT NULL DEFAULT '',
    whatsapp   TEXT NOT NULL DEFAULT '',
    cidade     TEXT NOT NULL DEFAULT '',
    termos     BOOLEAN NOT NULL DEFAULT false,
    ip         TEXT NOT NULL DEFAULT '',
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campanhas de conscientização
CREATE TABLE campanhas (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    titulo       TEXT NOT NULL,
    descricao    TEXT NOT NULL DEFAULT '',
    imagem_url   TEXT NOT NULL DEFAULT '',   -- /api/arquivos/<id>
    data_inicio  TIMESTAMPTZ,                -- pode ser NULL
    data_fim     TIMESTAMPTZ,                -- pode ser NULL
    status       TEXT NOT NULL DEFAULT 'ativa',   -- 'ativa' | 'encerrada'
    inscricoes   INTEGER NOT NULL DEFAULT 0,
    criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cadastro público de voluntários (/voluntarios)
CREATE TABLE voluntarios (
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

-- Assinaturas do abaixo-assinado
CREATE TABLE abaixo_assinado_assinaturas (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome       TEXT NOT NULL DEFAULT '',
    email      TEXT NOT NULL DEFAULT '',
    ddi        TEXT NOT NULL DEFAULT '',
    whatsapp   TEXT NOT NULL DEFAULT '',
    cidade     TEXT NOT NULL DEFAULT '',
    estado     TEXT NOT NULL DEFAULT '',
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Pegadinhas que já causaram problema

- **`status = 'publicado'`**, no masculino e sem "a". A listagem pública filtra por essa
  string exata; qualquer outro valor deixa a denúncia invisível no site.
- **`slug` é único** em `eventos` e `denuncias`. Gere a partir do título: minúsculas, sem
  acento, espaços viram `-`.
- **Não escreva em `visualizacoes`/`downloads`/`formulario_envios`** ao cadastrar conteúdo
  novo — são contadores que a aplicação incrementa sozinha.
- **`evento_inscricoes.evento_id` e `denuncia_leads.denuncia_id` têm FK com CASCADE.**
  O evento/denúncia precisa existir antes de inserir os filhos.

## O que eu quero fazer

<!-- Descreva aqui o que precisa inserir e cole os dados. Exemplos:

  "Cadastre estes 3 eventos: ..." (com título, descrição, data, imagem)
  "Importe esta planilha CSV de voluntários para a tabela voluntarios"
  "Suba este PDF e crie a denúncia apontando pra ele"

Peça para o Claude escrever um script .ts idempotente e mostrar o resultado
antes de rodar contra o banco de produção. -->
