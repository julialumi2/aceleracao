import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import extenso from "extenso";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, "..", "templates", "contrato-mentoria.docx");

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function formatDinheiro(valor) {
  return `R$ ${Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDinheiroExtenso(valor) {
  return `${formatDinheiro(valor)} (${extenso(Number(valor), { mode: "currency" })})`;
}

function formatDataExtenso(dataISO) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return `${String(dia).padStart(2, "0")} de ${MESES[mes - 1]} de ${ano}`;
}

function formatDataCurta(dataISO) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;
}

// Preenche o template do contrato (asaas-proxy/templates/contrato-mentoria.docx)
// com os dados do cliente e retorna o .docx pronto como Buffer.
export function gerarContratoDocx({ nome, cnpj, cidade, cep, email, valorMensal, diaVencimento, dataAssinatura }) {
  const zip = new PizZip(fs.readFileSync(TEMPLATE_PATH, "binary"));
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{{", end: "}}" },
  });

  const multaRescisao = Number(valorMensal) * 0.3;

  doc.render({
    nome_cliente: nome,
    cnpj_cliente: cnpj,
    cidade_cliente: cidade,
    cep_cliente: cep,
    email_cliente: email,
    valor_mensal_extenso: `${formatDinheiroExtenso(valorMensal)} mensais`,
    valor_mensal: formatDinheiro(valorMensal),
    multa_rescisao_valor: formatDinheiro(multaRescisao),
    dia_vencimento: diaVencimento,
    data_assinatura: formatDataCurta(dataAssinatura),
    data_assinatura_extenso: formatDataExtenso(dataAssinatura),
  });

  return doc.getZip().generate({ type: "nodebuffer" });
}
