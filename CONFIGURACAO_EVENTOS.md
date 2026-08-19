# 📋 Configuração de Eventos

Este documento explica como configurar eventos, incluindo opções de inscrição e controle de vagas.

## 🎨 Interface Administrativa (Recomendado)

A forma mais fácil de configurar eventos é através do **Painel Administrativo**:

1. Acesse: `https://pedrodeyrot.com/admin`
2. Faça login com suas credenciais
3. Na seção "Eventos", você verá o formulário com todas as opções

### Campos Disponíveis no Formulário:

**📝 Informações Básicas:**
- Título do Evento (obrigatório)
- Link do Evento (obrigatório)
- Descrição Detalhada (opcional)
- Imagem do Evento (obrigatório)

**⚙️ Configurações de Inscrição:**
- **Limite de Vagas**: Número máximo de inscrições (0 = ilimitado)
- **Formulário Interno Habilitado**: Checkbox para ativar/desativar
- **Link Formulário Externo**: Aparece quando interno está desabilitado

**🔗 Botões Extras:**
- Adicione quantos botões quiser com texto e link personalizados

---

## � Guia de Uso da Interface Administrativa

### 1️⃣ Criar Evento com Formulário Interno (Padrão)

1. Preencha o título e link do evento
2. Adicione descrição (opcional)
3. Em **"Configurações de Inscrição"**:
   - Defina limite de vagas (ex: 100) ou deixe 0 para ilimitado
   - Mantenha **"Formulário Interno Habilitado"** marcado ✅
4. Adicione a imagem
5. Clique em **"Adicionar Evento"**

**Resultado:** Botão "Quero Participar" abre formulário no site.

---

### 2️⃣ Criar Evento com Formulário Externo

1. Preencha os dados básicos
2. Em **"Configurações de Inscrição"**:
   - **Desmarque** "Formulário Interno Habilitado" ❌
   - Digite o link do formulário externo (ex: Google Forms)
3. Salve o evento

**Resultado:** Botão "Fazer Inscrição" abre o link externo.

---

### 3️⃣ Desabilitar Inscrições Temporariamente

1. Edite o evento existente (clique no botão de editar)
2. **Desmarque** "Formulário Interno Habilitado" ❌
3. **Deixe vazio** o campo "Link Formulário Externo"
4. Salve

**Resultado:** Mostra "Inscrições em breve".

---

### 4️⃣ Editar Evento Ativo

Você pode editar qualquer evento a qualquer momento:

1. Na lista de eventos, clique no botão **"Editar"** (ícone de lápis)
2. O formulário será preenchido com os dados atuais
3. Faça as alterações desejadas
4. Clique em **"Atualizar Evento"**

**As mudanças são instantâneas no site!** ⚡

---

## 🔧 Configuração Manual no Banco (Avançado)

Se preferir configurar diretamente no banco de dados:

### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `titulo` | string | Nome do evento |
| `imagemUrl` | string | URL da imagem do evento |
| `link` | string | Link para mais informações |
| `criadoEm` | timestamp | Data de criação |

### Campos Opcionais

| Campo | Tipo | Descrição | Valor Padrão |
|-------|------|-----------|--------------|
| `slug` | string | URL amigável (ex: "caminhada-25-anos") | ID do documento |
| `descricao` | string | Descrição completa do evento | - |
| `botoes` | array | Lista de botões personalizados | [] |
| `metaInscricoes` | number | Número máximo de vagas | 0 (ilimitado) |
| `inscricaoHabilitada` | boolean | Habilita formulário interno | true |
| `linkFormularioExterno` | string | Link para formulário externo | - |

---

## 📊 Cenários de Configuração

### 1️⃣ Evento com Formulário Interno (Padrão)

```javascript
{
  titulo: "Lançamento de Pré-Candidaturas",
  imagemUrl: "https://...",
  slug: "lancamento-pre-candidaturas",
  descricao: "Evento especial...",
  inscricaoHabilitada: true,  // ← ou omitir (true por padrão)
  metaInscricoes: 100  // ← Opcional: limite de vagas
}
```

**Comportamento:**
- ✅ Botão "Quero Participar" abre formulário no site
- ✅ Dados salvos no Postgres e no Google Sheets
- ✅ Contador de vagas (se `metaInscricoes` > 0)

---

### 2️⃣ Evento com Formulário Externo

```javascript
{
  titulo: "Workshop de Liderança",
  imagemUrl: "https://...",
  slug: "workshop-lideranca",
  descricao: "Workshop exclusivo...",
  inscricaoHabilitada: false,  // ← Desabilita formulário interno
  linkFormularioExterno: "https://forms.gle/abc123"  // ← Link externo
}
```

**Comportamento:**
- ✅ Botão "Fazer Inscrição" abre link externo em nova aba
- ✅ Não salva dados no sistema
- ❌ Não conta vagas automaticamente

---

### 3️⃣ Evento com Vagas Limitadas

```javascript
{
  titulo: "Encontro VIP",
  imagemUrl: "https://...",
  slug: "encontro-vip",
  inscricaoHabilitada: true,
  metaInscricoes: 50  // ← Apenas 50 vagas
}
```

**Comportamento:**
- ✅ Mostra contador: "X de 50 vagas"
- ✅ Barra de progresso visual
- ✅ Bloqueia inscrições quando atingir 50
- ✅ Mostra badge "Esgotado" na listagem

---

### 4️⃣ Evento Sem Inscrições (Em Breve)

```javascript
{
  titulo: "Grande Evento 2026",
  imagemUrl: "https://...",
  slug: "grande-evento-2026",
  inscricaoHabilitada: false  // ← Sem link externo
  // linkFormularioExterno não definido
}
```

**Comportamento:**
- ✅ Mostra mensagem: "Inscrições em breve"
- ❌ Não permite inscrição

---

## 🎨 Botões Personalizados

Adicione botões extras ao evento:

```javascript
{
  titulo: "Evento Especial",
  botoes: [
    {
      texto: "Ver Programação",
      link: "https://exemplo.com/programacao"
    },
    {
      texto: "Baixar Material",
      link: "https://exemplo.com/material.pdf"
    }
  ]
}
```

**Comportamento:**
- ✅ Botões aparecem acima do botão de inscrição
- ✅ Abrem em nova aba
- ✅ Design amarelo destacado

---

## 📈 Mudando Configuração de Eventos Ativos

### Desabilitar Formulário Interno (Usar Externo)

1. Acesse o evento no painel /admin
2. Adicione/edite o campo:
   - **Nome**: `inscricaoHabilitada`
   - **Tipo**: `boolean`
   - **Valor**: `false`
3. Adicione o campo:
   - **Nome**: `linkFormularioExterno`
   - **Tipo**: `string`
   - **Valor**: URL do formulário (ex: Google Forms)
4. Salve as alterações

✅ **Resultado**: Link externo substituirá o formulário interno imediatamente.

---

### Adicionar Limite de Vagas

1. Acesse o evento no painel /admin
2. Adicione/edite o campo:
   - **Nome**: `metaInscricoes`
   - **Tipo**: `number`
   - **Valor**: Número de vagas (ex: 100)
3. Salve as alterações

✅ **Resultado**: Contador de vagas aparecerá automaticamente.

---

### Reativar Formulário Interno

1. Acesse o evento no painel /admin
2. Edite o campo `inscricaoHabilitada` para `true`
3. (Opcional) Remova o campo `linkFormularioExterno`
4. Salve as alterações

✅ **Resultado**: Formulário interno voltará a funcionar.

---

## 🔍 Monitoramento de Inscrições

### Ver Total de Inscritos pela Interface

No Painel Administrativo, a lista de eventos mostra:
- Número total de eventos cadastrados
- Cards com título, imagem e botões de ação
- Você pode editar ou excluir eventos

### Ver Dados dos Inscritos

**No banco:**
```sql
SELECT * FROM evento_inscricoes WHERE evento_id = '<id do evento>';
```

O número de documentos na subcoleção `dadospessoas` é o total de inscritos.

Cada documento contém:
- nome, whatsapp, email
- cep, bairro, cidade, estado
- eventoId, eventoTitulo
- criadoEm (data/hora da inscrição)

### Exportar Dados

Os dados também são enviados para **Google Sheets** automaticamente através da API `/api/submit`.

---

## 💡 Dicas e Boas Práticas

### Quando usar cada modo:

**Formulário Interno:**
- ✅ Quando você quer controlar os dados no seu sistema
- ✅ Para eventos com limite de vagas
- ✅ Para ver estatísticas em tempo real
- ✅ Integração automática com Google Sheets

**Formulário Externo:**
- ✅ Para formulários complexos (muitos campos)
- ✅ Quando usa plataforma externa (Typeform, Google Forms)
- ✅ Para integrar com outros sistemas
- ✅ Quando precisa de recursos avançados (pagamentos, etc)

### Configurações Recomendadas:

**Evento Pequeno (até 50 pessoas):**
```
Limite de Vagas: 50
Formulário Interno: ✅ Habilitado
```

**Evento Grande (centenas de pessoas):**
```
Limite de Vagas: 200 (ou 0 se ilimitado)
Formulário Interno: ✅ Habilitado ou usar externo se preferir
```

**Evento com Inscrições Externas:**
```
Limite de Vagas: 0 (não conta automaticamente)
Formulário Interno: ❌ Desabilitado
Link Externo: https://forms.gle/seu-link
```

---

## 🔍 Monitoramento de Inscrições (Detalhado)

---

## ⚠️ Notas Importantes

1. **Contador Automático**: Quando você define `metaInscricoes > 0`, o sistema conta as inscrições automaticamente consultando a subcoleção `dadospessoas`.

2. **Performance**: A contagem de inscrições é feita no carregamento da página. Para eventos com muitas inscrições (>1000), considere usar um campo `totalInscricoes` atualizado por triggers.

3. **Formulário Externo**: Quando usa `inscricaoHabilitada: false`, você é responsável por gerenciar as inscrições externamente. O sistema não contará essas inscrições.

4. **Alterações em Tempo Real**: Mudanças no banco refletem imediatamente no site (após refresh da página).

---

## 🚀 Exemplos Práticos

### Evento Simples (Sem Limite)

```javascript
{
  titulo: "Reunião Comunitária",
  imagemUrl: "https://exemplo.com/reuniao.jpg",
  slug: "reuniao-comunitaria",
  link: "https://exemplo.com/info",
  descricao: "Venha participar!",
  criadoEm: new Date()
}
```

### Evento Completo (Todas Opções)

```javascript
{
  titulo: "Grande Encontro 2026",
  imagemUrl: "https://exemplo.com/evento.jpg",
  slug: "grande-encontro-2026",
  link: "https://exemplo.com/encontro",
  descricao: "Evento imperdível...",
  botoes: [
    { texto: "Ver Local", link: "https://maps.google.com/..." },
    { texto: "Baixar Convite", link: "https://exemplo.com/convite.pdf" }
  ],
  metaInscricoes: 200,
  inscricaoHabilitada: true,
  criadoEm: new Date()
}
```

---

## 📞 Suporte

Para dúvidas sobre configuração, use o painel `/admin` ou entre em contato com o suporte técnico.
