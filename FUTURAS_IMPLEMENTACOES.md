# 🚀 Futuras Implementações

## 📋 Dashboard Admin - Gerenciamento de Denúncias e Campanhas

### Objetivo
Criar uma aba dentro do painel administrativo (AdminDashboard) para gerenciar:
- **Denúncias**: Upload, edição e publicação de novos dossiês
- **Campanhas**: Criação e gestão de campanhas de conscientização

### Funcionalidades Planejadas

#### 1. Gerenciamento de Denúncias
- [ ] Upload de PDFs de denúncias
- [ ] Editor de conteúdo (título, seções, descrições)
- [ ] Prévia em tempo real antes de publicar
- [ ] Controle de visibilidade (publicado/rascunho)
- [ ] Estatísticas de acesso (quantas pessoas preencheram o formulário)
- [ ] Lista de emails que acessaram cada denúncia

#### 2. Gerenciamento de Campanhas
- [ ] Criação de novas campanhas de voluntariado
- [ ] Upload de imagens e banners
- [ ] Configuração de formulários personalizados
- [ ] Controle de datas (início/fim)
- [ ] Relatórios de inscrições

#### 3. Sistema de Arquivos
- [ ] Storage no Firebase Storage para PDFs
- [ ] Organização por pastas (denuncias/, campanhas/, documentos/)
- [ ] Versionamento de documentos
- [ ] Backup automático

### Estrutura Técnica Sugerida

```typescript
// Firestore Collections
denuncias/ (collection)
  ├─ {denunciaId}/
      ├─ titulo: string
      ├─ slug: string (ex: "safadao")
      ├─ descricao: string
      ├─ pdfUrl: string (Firebase Storage)
      ├─ secoes: array<{titulo, conteudo}>
      ├─ status: "publicado" | "rascunho"
      ├─ criadoEm: timestamp
      ├─ atualizadoEm: timestamp
      └─ estatisticas: {visualizacoes, downloads}

campanhas/ (collection)
  ├─ {campanhaId}/
      ├─ titulo: string
      ├─ descricao: string
      ├─ imagemUrl: string
      ├─ dataInicio: timestamp
      ├─ dataFim: timestamp
      ├─ status: "ativa" | "encerrada"
      └─ inscricoes: number
```

### Páginas a Criar

1. **AdminDashboard.tsx** (atualizar)
   - Adicionar nova aba "Denúncias"
   - Adicionar nova aba "Campanhas"

2. **AdminDenuncias.tsx** (nova)
   - Lista de todas as denúncias
   - Botão "Nova Denúncia"
   - Editar/Excluir denúncias existentes

3. **AdminDenunciaEditor.tsx** (nova)
   - Formulário completo para criar/editar
   - Upload de PDF
   - Editor de seções
   - Prévia em tempo real

4. **AdminCampanhas.tsx** (nova)
   - Lista de campanhas
   - Criar/editar campanhas

### Prioridade
⭐ **Média** - Implementar após:
1. Resolver questões de routing (404s)
2. Configurar Google Sheets webhook
3. Testar sistema de denúncia atual em produção

### Notas
- Considerar usar um editor WYSIWYG (TinyMCE, Quill, ou Tiptap)
- Implementar permissões granulares (nem todo admin pode criar denúncias)
- Adicionar logs de auditoria (quem criou/editou o quê)
