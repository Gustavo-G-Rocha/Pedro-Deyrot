# Deploy no Railway

O site agora roda como **um único serviço Node** (Express servindo a API + o build do Vite),
com **Postgres** como banco.

---

## 1. Criar o projeto e o banco

1. Em [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
   → selecione `Gustavo-G-Rocha/Pedro-Deyrot`.
2. Dentro do projeto, clique em **+ New** → **Database** → **Add PostgreSQL**.

Você vai ficar com dois serviços no mesmo projeto: o app e o `Postgres`.

---

## 2. Conectar o Postgres ao site

O Railway **não** conecta os dois sozinho — você precisa declarar a variável.

No serviço **do site** (não no do Postgres) → aba **Variables** → **+ New Variable**:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |

Digite exatamente isso, com as chaves duplas. É uma *reference variable*: o Railway
resolve para a URL interna do banco no deploy e mantém sincronizada se o banco mudar.

> Se você renomeou o serviço do banco, troque `Postgres` pelo nome que aparece no card.
> A rede interna do Railway não cobra egress — por isso use `DATABASE_URL` e não `DATABASE_PUBLIC_URL`.

---

## 3. Demais variáveis obrigatórias

Ainda em **Variables** do serviço do site:

| Variável | Valor | Para quê |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | conexão com o banco |
| `JWT_SECRET` | uma string aleatória longa | assina o token de login do `/admin` |
| `ADMIN_EMAIL` | seu email | cria/atualiza o admin no boot |
| `ADMIN_PASSWORD` | uma senha forte | idem |

Para gerar o `JWT_SECRET`:

```bash
openssl rand -hex 32
```

Opcional (o site funciona sem):

| Variável | Para quê |
|---|---|
| `GOOGLE_SHEETS_WEBHOOK_URL` | espelha os formulários numa planilha do Google |

**Não** defina `PORT` — o Railway injeta sozinho, e o `server.ts` já lê `process.env.PORT`.

### Sobre `ADMIN_PASSWORD`

A cada boot, o servidor faz um upsert do admin com essa senha (hash bcrypt na tabela
`admin_users`). Isso torna o primeiro acesso simples e destrava a conta se você esquecer a senha.

O efeito colateral é que a senha em texto puro fica guardada nas variáveis do Railway.
Depois do primeiro deploy bem-sucedido, **remova `ADMIN_PASSWORD`** — o admin continua
existindo no banco, e sem a variável o seed é pulado.

---

## 4. Gerar o domínio

Serviço do site → **Settings** → **Networking** → **Generate Domain**.
Use a porta que o Railway sugerir (ele detecta pela variável `PORT`).

---

## 5. Popular as denúncias

O schema é aplicado sozinho no boot, mas as denúncias precisam ser cadastradas.
Dá pra fazer pelo painel `/admin` (uma a uma, subindo o PDF) ou de uma vez pelo
script, que roda **da sua máquina**.

**a)** Pegue a URL pública do banco: serviço **Postgres** no Railway → **Variables** →
copie o valor de **`DATABASE_PUBLIC_URL`** (a que tem `proxy.rlwy.net`; a
`.railway.internal` só resolve dentro do Railway).

**b)** Crie um `.env` local com **apenas** essa linha:

```bash
DATABASE_URL=<cole a DATABASE_PUBLIC_URL aqui>
```

Não coloque `ADMIN_EMAIL`/`ADMIN_PASSWORD` nesse `.env`: o script aplica as migrations
e essas variáveis reescreveriam a senha do admin em produção.

**c)** Deixe os PDFs numa pasta e rode:

```bash
npm install
npm run seed-denuncias                 # simulação, não grava nada
npm run seed-denuncias -- --aplicar    # grava
```

Outra pasta: `npm run seed-denuncias -- --aplicar "C:/caminho/da/pasta"`.

O script casa cada PDF com a denúncia pelo nome do arquivo (ignorando o prefixo de
timestamp), grava o binário na tabela `arquivos` e aponta a denúncia para
`/api/arquivos/<id>`, com as datas originais — é a data que define a ordem da listagem.
É idempotente: rodar duas vezes não duplica arquivo nem zera os contadores.

**d)** Confira o resultado:

```bash
npm run db:check
```

Mostra a contagem de cada tabela e as denúncias com seus PDFs.

---

## 6. Como os dados são guardados

| O quê | Onde |
|---|---|
| conteúdo do site | Postgres (10 tabelas, `db/schema.sql`) |
| login do admin | JWT + bcrypt na tabela `admin_users` |
| PDFs e imagens | tabela `arquivos` (bytea), servida em `/api/arquivos/:id` |
| proteção de escrita | middleware `exigirAdmin` nas rotas |
| hospedagem | Railway (`railway.json`) |

O schema é aplicado automaticamente no boot (`runMigrations`), então não existe passo
manual de migration — subir o deploy já deixa o banco pronto.

### Health check

`GET /api/health` responde `{ ok: true, db: "up" }`. O `railway.json` já usa esse
endpoint, então um deploy só é promovido depois que o banco responde.

---

## Limitação conhecida: arquivos em `bytea`

Os PDFs e imagens ficam **dentro do Postgres**, como você pediu (tudo no Railway, sem
bucket externo). Funciona bem nessa escala, mas vale saber:

- Há um teto de **50 MB por arquivo** ([server/routes/arquivos.ts](server/routes/arquivos.ts)).
- Os arquivos entram nos backups do banco, que ficam proporcionalmente maiores.
- Não há CDN: cada download passa pelo servidor Node. As respostas vão com
  `Cache-Control: immutable`, então o navegador só baixa uma vez.

Se um dia o volume de PDFs crescer muito, o caminho é trocar a tabela `arquivos` por
Cloudflare R2/S3 — só o `server/routes/arquivos.ts` e o `arquivos.upload` do
[src/lib/api.ts](src/lib/api.ts) mudariam; o resto do código não sabe onde o arquivo mora.

---

## Rodando local

```bash
npm install
cp .env.example .env     # preencha DATABASE_URL e JWT_SECRET
npm run dev              # http://localhost:3000
```

Para o `DATABASE_URL` local você pode apontar para o próprio banco do Railway
(usando a `DATABASE_PUBLIC_URL`) ou subir um Postgres local.
