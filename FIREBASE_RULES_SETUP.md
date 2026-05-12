# 🔒 Configuração das Regras do Firebase

## Como Aplicar as Regras do Firestore

### Método 1: Via Firebase Console (Recomendado)

#### Firestore Rules:
1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras** (Rules)
5. Copie todo o conteúdo do arquivo `firestore.rules` deste projeto
6. Cole no editor de regras do Firebase Console
7. Clique em **Publicar** (Publish)

#### Storage Rules:
1. No Firebase Console, clique em **Storage**
2. Clique na aba **Regras** (Rules)
3. Copie todo o conteúdo do arquivo `storage.rules` deste projeto
4. Cole no editor de regras
5. Clique em **Publicar** (Publish)

### Método 2: Via Firebase CLI

Se você tem o Firebase CLI instalado:

```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar o projeto (se ainda não foi feito)
firebase init firestore

# Implantar apenas as regras do Firestore
firebase deploy --only firestore:rules

# Implantar regras do Storage também
firebase deploy --only storage:rules

# Ou implantar tudo de uma vez
firebase deploy --only firestore,storage
```

## 📋 Estrutura das Regras Implementadas

### Firestore Rules (firestore.rules)

#### Collections e Permissões:

#### 1. `denuncias_formulario/`
- **Propósito**: Armazena dados dos formulários preenchidos por usuários
- **Leitura**: 🟢 Pública (para verificar se email já existe)
- **Criação**: 🟢 Pública (qualquer pessoa pode preencher o formulário)
- **Atualização/Deleção**: 🔴 Apenas admins autenticados

#### 2. `denuncias/`
- **Propósito**: Dossiês de denúncias criados pelo admin
- **Leitura**: 🟢 Pública (para exibir denúncias publicadas)
- **Criação/Atualização/Deleção**: 🔴 Apenas admins autenticados

#### 3. `campanhas/`
- **Propósito**: Campanhas de conscientização
- **Leitura**: 🟢 Pública (para exibir campanhas)
- **Criação/Atualização/Deleção**: 🔴 Apenas admins autenticados

#### 4. `eventos/`
- **Propósito**: Eventos cadastrados
- **Leitura**: 🟢 Pública (para exibir eventos)
- **Criação/Atualização/Deleção**: 🔴 Apenas admins autenticados

### Storage Rules (storage.rules)

#### Pastas e Permissões:

#### 1. `eventos/`
- **Upload**: 🔴 Apenas admins autenticados
- **Tipo de Arquivo**: Apenas imagens
- **Tamanho Máximo**: 10MB
- **Leitura**: 🟢 Pública

#### 2. `denuncias/`
- **Upload**: 🔴 Apenas admins autenticados
- **Tipo de Arquivo**: Apenas PDFs
- **Tamanho Máximo**: 10MB
- **Leitura**: 🟢 Pública

#### 3. `campanhas/`
- **Upload**: 🔴 Apenas admins autenticados
- **Tipo de Arquivo**: Apenas imagens
- **Tamanho Máximo**: 10MB
- **Leitura**: 🟢 Pública

## 🔐 Segurança

As regras implementadas garantem que:

- ✅ Usuários anônimos podem preencher o formulário de acesso
- ✅ O sistema pode verificar se um email já foi cadastrado
- ✅ Apenas admins autenticados podem criar/editar/deletar conteúdo
- ✅ Apenas admins autenticados podem fazer upload de arquivos
- ✅ Validação de tipo de arquivo (imagens ou PDFs conforme a pasta)
- ✅ Limite de tamanho de 10MB para uploads
- ✅ Conteúdo público (denúncias, campanhas, eventos) pode ser lido por qualquer pessoa
- ✅ Todas as outras collections e pastas não especificadas são bloqueadas

## 📁 Arquivos de Configuração Criados

- ✅ `firestore.rules` - Regras de segurança do Firestore
- ✅ `storage.rules` - Regras de segurança do Storage
- ✅ `firebase.json` - Configuração do Firebase CLI
- ✅ `firestore.indexes.json` - Índices para otimização de queries

## ⚠️ Importante

Após aplicar as regras, aguarde alguns segundos para que as alterações sejam propagadas. 

Se encontrar erros de permissão, verifique:
1. Se as regras foram publicadas corretamente
2. Se o usuário está autenticado ao tentar operações de admin
3. Se está usando as collections corretas no código

## 🔄 Alterações no Código

O código foi atualizado para usar `denuncias_formulario` em vez de `denuncias` para:
- Separar dados de formulários dos dossiês de denúncias
- Melhorar a organização dos dados
- Facilitar a implementação de regras de segurança específicas

### Arquivos Atualizados:
- ✅ `src/utils/denunciaAccess.ts` - Agora usa `denuncias_formulario`
- ✅ `firestore.rules` - Regras de segurança configuradas
