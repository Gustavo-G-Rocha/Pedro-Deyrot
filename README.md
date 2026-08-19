# Pedro Deyrot

Site institucional com área administrativa: eventos com inscrição, dossiês de denúncias
com PDF, campanhas e cadastro de voluntários.

**Stack:** React 19 + Vite + Tailwind no front, Express + Postgres no back, deploy no Railway.

## Rodando local

**Pré-requisitos:** Node.js 20+ e um Postgres acessível.

```bash
npm install
cp .env.example .env     # preencha DATABASE_URL e JWT_SECRET
npm run dev              # http://localhost:3000
```

O schema (`db/schema.sql`) é aplicado automaticamente no boot — não há passo manual
de migration.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento (Express + Vite em middleware mode) |
| `npm run build` | build de produção do front em `dist/` |
| `npm start` | sobe em produção (serve `dist/` + API) |
| `npm run lint` | checagem de tipos (`tsc --noEmit`) |
| `npm run seed-denuncias` | cria as denúncias a partir dos PDFs de uma pasta local |
| `npm run db:check` | mostra a contagem de cada tabela |

## Estrutura

```
db/schema.sql          schema do Postgres
server/
  db.ts                pool de conexão + aplicação do schema no boot
  auth.ts              JWT e o middleware exigirAdmin
  routes/              endpoints REST (auth, arquivos, eventos, denuncias, campanhas, voluntarios)
scripts/
  seed-denuncias.ts    popula as denúncias a partir de PDFs locais
src/
  lib/api.ts           cliente REST usado por todas as páginas
  pages/               telas públicas e administrativas
server.ts              monta a API e serve o front
```

## Deploy

Veja [RAILWAY.md](RAILWAY.md) — inclui as variáveis de ambiente e como ligar o Postgres
ao serviço do site.
