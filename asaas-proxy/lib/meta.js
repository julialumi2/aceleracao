import crypto from "node:crypto";

function sha256(valor) {
  return crypto.createHash("sha256").update(valor).digest("hex");
}

function normalizarTexto(valor) {
  return (typeof valor === "string" ? valor : "").trim().toLowerCase();
}

// Mesma regra do link de WhatsApp do painel: telefone salvo só com DDD +
// número ganha o 55 do Brasil, senão a Meta não casa com a conta da pessoa.
export function normalizarTelefone(telefone) {
  let digitos = (typeof telefone === "string" ? telefone : "").replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) digitos = `55${digitos}`;
  return digitos;
}

// user_data da API de Conversões: dado pessoal sai daqui já normalizado e
// com hash SHA-256; IP, user agent e cookies da Meta vão em texto puro,
// como a Meta exige. Campo vazio é omitido — hash de string vazia derruba
// a qualidade da correspondência.
export function montarUserData({ email, telefone, nome, ip, userAgent, fbp, fbc }) {
  const userData = {};

  const emailNormalizado = normalizarTexto(email);
  if (emailNormalizado) userData.em = [sha256(emailNormalizado)];

  const telefoneNormalizado = normalizarTelefone(telefone);
  if (telefoneNormalizado) userData.ph = [sha256(telefoneNormalizado)];

  const partesNome = normalizarTexto(nome).split(/\s+/).filter(Boolean);
  if (partesNome.length > 0) userData.fn = [sha256(partesNome[0])];
  if (partesNome.length > 1) userData.ln = [sha256(partesNome[partesNome.length - 1])];

  if (ip) userData.client_ip_address = ip;
  if (userAgent) userData.client_user_agent = userAgent;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  return userData;
}
