# Instruções para Integração com Google Sheets

Para que os dados sejam salvos em uma planilha do Google, siga estes passos:

1.  Crie uma nova Planilha Google (Google Sheets).
2.  Na primeira linha, crie os cabeçalhos: `Data`, `Nome`, `WhatsApp`, `Email`, `CEP`, `Bairro`, `Estado`, `Cidade`.
3.  Vá em **Extensões** > **Apps Script**.
4.  Apague o código existente e cole o seguinte:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date(),
    data.nome,
    data.whatsapp,
    data.email,
    data.cep,
    data.bairro,
    data.estado,
    data.cidade
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({"success": true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

5.  Clique em **Implantar** (Deploy) > **Nova Implantação**.
6.  Selecione o tipo **App da Web**.
7.  Em "Quem pode acessar", selecione **Qualquer pessoa** (Any anonymous user).
8.  Clique em **Implantar**.
9.  Copie o **URL do App da Web**.
10. No Google AI Studio, adicione este URL à sua aba de **Secrets** (Configurações) com o nome: `GOOGLE_SHEETS_WEBHOOK_URL`.

Depois disso, o formulário enviará os dados automaticamente para sua planilha!
