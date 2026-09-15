const CHAVE = "campanha-de-origem";
const VALIDADE_MS = 30 * 24 * 60 * 60 * 1000;
const CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];

function utmsDaUrl() {
  const params = new URLSearchParams(window.location.search);
  const utms = {};
  for (const campo of CAMPOS) {
    const valor = params.get(campo)?.trim();
    if (valor) utms[campo] = valor.slice(0, 200);
  }
  return Object.keys(utms).length > 0 ? utms : null;
}

// O anúncio costuma levar pra página inicial, e os botões de lá vão pro
// /comecar com um link simples, que perde a query string no caminho — por
// isso a campanha fica guardada no navegador assim que a pessoa chega.
// Vale a última campanha clicada, por 30 dias.
export function guardarUtmsDaUrl() {
  const utms = utmsDaUrl();
  if (!utms) return;
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ utms, salvoEm: Date.now() }));
  } catch {
    // Navegador sem armazenamento — lerUtms() ainda pega da URL da própria página.
  }
}

export function lerUtms() {
  const daUrl = utmsDaUrl();
  if (daUrl) return daUrl;
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo && Date.now() - salvo.salvoEm < VALIDADE_MS) return salvo.utms;
  } catch {
    // Valor corrompido ou armazenamento bloqueado — segue sem campanha.
  }
  return {};
}
