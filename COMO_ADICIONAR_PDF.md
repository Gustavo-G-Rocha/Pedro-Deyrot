# 📄 Como Adicionar o Arquivo PDF de Denúncia

## ⚠️ IMPORTANTE - Arquivo PDF Não Encontrado

O botão de download na página está configurado, mas o arquivo PDF ainda não foi adicionado ao projeto.

---

## 📥 Passos para Adicionar o PDF

### 1. Salvar o PDF na Pasta Correta

O arquivo PDF do dossiê deve ser salvo em:
```
c:\Users\Felipi\Pictures\Deyrot\Pedro-Deyrot\public\documentos\
```

**Nome do arquivo:** `dossie-wesley-safadao-completo.pdf`

**Caminho completo:**
```
c:\Users\Felipi\Pictures\Deyrot\Pedro-Deyrot\public\documentos\dossie-wesley-safadao-completo.pdf
```

### 2. Verificar se o Arquivo Está Correto

Abra o terminal PowerShell e execute:
```powershell
Test-Path "public\documentos\dossie-wesley-safadao-completo.pdf"
```

Se retornar `True`, o arquivo está no lugar certo! ✅

### 3. Fazer Build e Deploy

Depois de adicionar o PDF, execute:
```bash
npm run build
npx wrangler pages deploy dist --project-name=pedrodeyrot
```

---

## 🗂️ Estrutura de Arquivos

```
Pedro-Deyrot/
├── public/
│   ├── documentos/           ← NOVA PASTA CRIADA
│   │   └── dossie-wesley-safadao-completo.pdf  ← COLOQUE O PDF AQUI
│   ├── fundo.png
│   ├── fundohome.png
│   └── logo.png
├── src/
└── ...
```

---

## 🔗 Como o Link Funciona

Na página `/safadao/arquivos`, o botão de download está configurado assim:
```tsx
href="/documentos/dossie-wesley-safadao-completo.pdf"
download="Dossie_Grupo_WS_Wesley_Safadao.pdf"
```

- **URL de origem:** `/documentos/dossie-wesley-safadao-completo.pdf` (busca em `public/documentos/`)
- **Nome ao baixar:** `Dossie_Grupo_WS_Wesley_Safadao.pdf` (nome que aparece no download)

---

## ✅ Checklist

- [ ] Pasta `public/documentos/` criada ✅ (JÁ FEITO)
- [ ] PDF salvo em `public/documentos/dossie-wesley-safadao-completo.pdf`
- [ ] Arquivo PDF tem as 9 páginas completas
- [ ] Executar `npm run build`
- [ ] Executar `npx wrangler pages deploy dist --project-name=pedrodeyrot`
- [ ] Testar download no site: https://pedrodeyrot.com/safadao/arquivos

---

## 🐛 Resolução de Problemas

### Erro: "404 - Arquivo não encontrado"
**Causa:** O PDF não está na pasta correta ou tem nome diferente  
**Solução:** Verificar caminho e nome exato do arquivo

### Erro: "PDF corrompido ao abrir"
**Causa:** Arquivo não foi copiado corretamente  
**Solução:** Copiar novamente o PDF original

### Erro: "Download não inicia"
**Causa:** Navegador bloqueando ou arquivo muito grande  
**Solução:** 
1. Verificar se o arquivo tem menos de 25 MB
2. Testar em outro navegador
3. Verificar console do navegador (F12) para erros

---

## 📊 Tamanho do Arquivo

**Limite Cloudflare Pages:** 25 MB por arquivo

Se o PDF for maior que 25 MB, você pode:
1. **Comprimir o PDF:** Use ferramentas online como smallpdf.com ou ilovepdf.com
2. **Dividir em partes:** Criar PDF por seção (holding, contratos, processos, etc.)
3. **Usar Firebase Storage:** Hospedar o PDF no Firebase e linkar externamente

---

## 🔄 Alternativa: Firebase Storage

Se preferir hospedar no Firebase Storage (para arquivos grandes):

1. **Upload no Firebase Console:**
   - Firebase Console → Storage → Upload files
   - Copiar URL pública do arquivo

2. **Atualizar o link na página:**
   ```tsx
   href="https://firebasestorage.googleapis.com/.../dossie.pdf"
   ```

---

## 💡 Dica

Para verificar se o arquivo está sendo servido corretamente em produção:
```
https://pedrodeyrot.com/documentos/dossie-wesley-safadao-completo.pdf
```

Se abrir o PDF no navegador, está funcionando! 🎉
