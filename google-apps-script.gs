// ============================================================
// PEDRO DEYROT — Google Apps Script
// Cole este código em: Extensions → Apps Script → Code.gs
// ============================================================

var SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// ============================================================
// PONTO DE ENTRADA — recebe todos os formulários do site
// ============================================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var tipo = data.tipo || '';

    if (tipo === 'voluntario') {
      salvarVoluntario(data);
    } else if (tipo === 'evento') {
      salvarEvento(data);
    } else if (tipo === 'denuncia_formulario') {
      salvarDenuncia(data);
    } else {
      salvarOutros(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Dados recebidos com sucesso!' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Erro no doPost: ' + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// VOLUNTÁRIOS → aba fixa "Voluntários"
// ============================================================
function salvarVoluntario(data) {
  var sheet = getOrCreateSheet('Voluntários', [
    'Data/Hora', 'Nome', 'DDI', 'WhatsApp', 'E-mail', 'CEP', 'Bairro', 'Cidade', 'Estado', 'Especialidade'
  ]);

  sheet.appendRow([
    formatarData(data.timestamp),
    data.nome          || '',
    data.ddi           || '+55',
    data.whatsapp      || '',
    data.email         || '',
    data.cep           || '',
    data.bairro        || '',
    data.cidade        || '',
    data.estado        || '',
    data.especialidade || ''
  ]);
}

// ============================================================
// EVENTOS → aba com o nome do evento (criada automaticamente)
// ============================================================
function salvarEvento(data) {
  var nomeAba = data.nomeEvento || 'Evento Desconhecido';
  var sheet = getOrCreateSheet(nomeAba, [
    'Data/Hora', 'Nome', 'WhatsApp', 'E-mail', 'CEP', 'Bairro', 'Cidade', 'Estado'
  ]);

  sheet.appendRow([
    formatarData(data.timestamp),
    data.nome     || '',
    data.whatsapp || '',
    data.email    || '',
    data.cep      || '',
    data.bairro   || '',
    data.cidade   || '',
    data.estado   || ''
  ]);
}

// ============================================================
// DENÚNCIAS → aba "D-{Título da Denúncia}" (criada automaticamente)
// ============================================================
function salvarDenuncia(data) {
  var nomeAba = data.nomeEvento || ('D-' + (data.tituloDenuncia || data.slug || 'Desconhecida'));
  var sheet = getOrCreateSheet(nomeAba, [
    'Data/Hora', 'Nome', 'WhatsApp', 'E-mail', 'Cidade', 'Denúncia', 'Slug'
  ]);

  sheet.appendRow([
    formatarData(data.timestamp),
    data.nome            || '',
    data.whatsapp        || '',
    data.email           || '',
    data.cidade          || '',
    data.tituloDenuncia  || '',
    data.slug            || ''
  ]);
}

// ============================================================
// OUTROS (fallback) → aba "Outros"
// ============================================================
function salvarOutros(data) {
  var sheet = getOrCreateSheet('Outros', [
    'Data/Hora', 'Tipo', 'Nome', 'WhatsApp', 'E-mail', 'Cidade', 'Raw'
  ]);

  sheet.appendRow([
    formatarData(data.timestamp),
    data.tipo     || '',
    data.nome     || '',
    data.whatsapp || '',
    data.email    || '',
    data.cidade   || '',
    JSON.stringify(data)
  ]);
}

// ============================================================
// HELPER — busca ou cria a aba com cabeçalho formatado
// ============================================================
function getOrCreateSheet(nome, cabecalhos) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Nome de aba tem limite de 100 chars no Sheets
  var nomeTruncado = nome.substring(0, 100);
  var sheet = ss.getSheetByName(nomeTruncado);

  if (!sheet) {
    sheet = ss.insertSheet(nomeTruncado);

    // Inserir cabeçalhos
    sheet.appendRow(cabecalhos);

    // Formatar cabeçalho: fundo amarelo, negrito, texto centralizado
    var headerRange = sheet.getRange(1, 1, 1, cabecalhos.length);
    headerRange.setBackground('#f4b400');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    headerRange.setFontColor('#000000');

    // Congelar linha do cabeçalho
    sheet.setFrozenRows(1);

    // Ajustar largura das colunas automaticamente
    sheet.autoResizeColumns(1, cabecalhos.length);
  }

  return sheet;
}

// ============================================================
// HELPER — formata timestamp ISO para horário de Brasília
// ============================================================
function formatarData(timestamp) {
  if (!timestamp) return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  var date = new Date(timestamp);
  return Utilities.formatDate(date, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');
}
