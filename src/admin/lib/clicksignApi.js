import { supabase } from "../../lib/supabase.js";

// Mesmo serviço do Asaas (asaas-proxy) — agora também gera e envia o
// contrato pro Clicksign.
const ASAAS_PROXY_URL = import.meta.env.VITE_ASAAS_PROXY_URL || "http://localhost:3000";

// Preenche o template do contrato com os dados do cliente e envia pro
// Clicksign pra assinatura, via asaas-proxy (a chave de API não pode
// ficar no navegador). Lança erro com mensagem legível em caso de falha.
export async function gerarContratoClicksign({ nome, cnpj, cidade, cep, email, telefone, valorMensal, diaVencimento, dataAssinatura, html }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sessão expirada — faça login de novo.");

  const response = await fetch(`${ASAAS_PROXY_URL}/clicksign/gerar-contrato`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ nome, cnpj, cidade, cep, email, telefone, valorMensal, diaVencimento, dataAssinatura, html }),
  });

  const data = await response.json().catch(() => null);

  if (response.status === 503) {
    throw new Error("Integração com o Clicksign ainda não foi configurada no servidor.");
  }
  if (!response.ok) {
    throw new Error(data?.error || "Não foi possível gerar o contrato no Clicksign.");
  }

  return data;
}

// Só preenche o modelo e baixa o .docx pra conferir — não fala com o
// Clicksign, não manda nada pra ninguém.
export async function baixarRascunhoContrato({ nome, cnpj, cidade, cep, email, valorMensal, diaVencimento, dataAssinatura }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sessão expirada — faça login de novo.");

  const response = await fetch(`${ASAAS_PROXY_URL}/clicksign/preview-contrato`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ nome, cnpj, cidade, cep, email, valorMensal, diaVencimento, dataAssinatura }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Não foi possível gerar o rascunho do contrato.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contrato-${nome.replace(/[^\w]+/g, "-")}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Preenche o modelo e devolve o texto em HTML pra revisar/editar no
// modal antes de mandar de verdade — não fala com o Clicksign.
export async function visualizarContratoHtml({ nome, cnpj, cidade, cep, email, valorMensal, diaVencimento, dataAssinatura }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sessão expirada — faça login de novo.");

  const response = await fetch(`${ASAAS_PROXY_URL}/clicksign/preview-html`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ nome, cnpj, cidade, cep, email, valorMensal, diaVencimento, dataAssinatura }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || "Não foi possível gerar a prévia do contrato.");
  }
  return data.html;
}
