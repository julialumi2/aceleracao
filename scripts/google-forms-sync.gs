/**
 * Sincroniza respostas do Google Forms com a tabela `leads` do Supabase.
 *
 * COMO INSTALAR:
 * 1. Abra a planilha de respostas do seu Forms.
 * 2. Menu Extensões > Apps Script.
 * 3. Apague o conteúdo padrão e cole este arquivo inteiro.
 * 4. Menu Editar > Configurações do projeto > Propriedades do script > adicione:
 *      SUPABASE_URL = http://localhost:54321  (ou a URL do seu projeto em produção)
 *      SUPABASE_SERVICE_ROLE_KEY = <service_role key, NUNCA a anon key>
 *    (Nunca cole a service_role key direto no código — sempre em Script Properties.)
 * 5. No editor, clique em Acionadores (ícone de relógio) > Adicionar acionador:
 *      Função: onFormSubmit | Evento: Ao enviar o formulário
 * 6. Ajuste o mapeamento em FIELD_MAP abaixo para bater com os títulos exatos
 *    das perguntas do seu Forms (copie e cole os títulos, com acentuação).
 */

// Título exato da pergunta no Forms -> coluna na tabela `leads`.
const FIELD_MAP = {
  "Nome": "nome",
  "E-mail": "email",
  "CNPJ": "cnpj",
  "Endereço": "endereco",
  "CEP": "cep",
  "Banco": "banco",
  "Agência": "agencia",
  "Conta": "conta",
  "Dias de funcionamento": "dias_funcionamento", // pergunta de múltipla escolha (checkbox)
  "Horário de abertura": "horario_abertura",
  "Horário de fechamento": "horario_fechamento",
};

function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const SUPABASE_URL = props.getProperty("SUPABASE_URL");
  const SERVICE_ROLE_KEY = props.getProperty("SUPABASE_SERVICE_ROLE_KEY");

  const payload = {};
  e.response.getItemResponses().forEach((item) => {
    const column = FIELD_MAP[item.getItem().getTitle()];
    if (!column) return; // pergunta sem mapeamento, ignora

    const answer = item.getResponse();
    payload[column] = column === "dias_funcionamento"
      ? (Array.isArray(answer) ? answer : [answer]) // checkbox vem como array
      : answer;
  });

  if (!payload.nome || !payload.email) {
    Logger.log("Resposta ignorada: nome ou e-mail ausente. Payload: " + JSON.stringify(payload));
    return;
  }

  const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: "post",
    contentType: "application/json",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal",
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() >= 300) {
    Logger.log("Falha ao enviar lead: " + response.getContentText());
  }
}
