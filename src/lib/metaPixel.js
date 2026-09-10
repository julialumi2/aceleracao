// Meta Pixel da landing page (aceleracao.artesanosburger.com.br) — só é
// carregado pelas telas públicas de captação (LandingPage e /comecar),
// nunca no painel da equipe nem no cadastro de cliente fechado, que
// dividem o mesmo bundle mas não são funil de anúncio.
const META_PIXEL_ID = "1488572952942368";
const ASAAS_PROXY_URL = import.meta.env.VITE_ASAAS_PROXY_URL || "http://localhost:3000";
const CONTENT_NAME = "Aceleração de Delivery";

let pixelIniciado = false;
let pageViewEnviado = false;

function gerarEventId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function lerCookie(nome) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// Quem chega por anúncio traz ?fbclid= só na primeira página — some ao
// clicar pro /comecar. Grava o _fbc no formato da Meta já na chegada,
// pra ele ainda existir no envio do formulário mesmo se o Pixel estiver
// bloqueado (quando não está, o próprio Pixel faz o mesmo).
function guardarFbclid() {
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (!fbclid || lerCookie("_fbc")) return;
  const noventaDias = 90 * 24 * 60 * 60;
  document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; path=/; max-age=${noventaDias}; SameSite=Lax`;
}

// Snippet oficial do Meta Pixel, transcrito como função do bundle em vez
// de script inline.
function carregarScriptPixel() {
  if (window.fbq) return;
  const n = (window.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  // Sem isto o fbevents.js dispara um PageView extra a cada mudança de
  // URL — inclusive clique em âncora (#topo) — já que o site é SPA.
  n.disablePushState = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
}

function iniciarMetaPixel() {
  if (pixelIniciado) return;
  pixelIniciado = true;
  guardarFbclid();
  carregarScriptPixel();
  window.fbq("init", META_PIXEL_ID);
}

// Um PageView por carregamento de página. Navegação por âncora (#secao)
// não remonta a tela, e a trava cobre o efeito duplicado do StrictMode.
export function registrarPageView() {
  if (pageViewEnviado) return;
  pageViewEnviado = true;
  iniciarMetaPixel();
  window.fbq("track", "PageView", {}, { eventID: gerarEventId() });
}

// Só depois do formulário salvo de verdade. Mesmo event_id no Pixel e na
// API de Conversões (via asaas-proxy, que guarda o token e faz o hash dos
// dados pessoais) — a Meta conta uma vez só. Falha aqui não desfaz o
// lead já salvo, então o envio ao servidor é best-effort.
export function registrarLead({ telefone, nome }) {
  iniciarMetaPixel();
  const eventId = gerarEventId();
  const eventTime = Math.floor(Date.now() / 1000);

  window.fbq("track", "Lead", { content_name: CONTENT_NAME }, { eventID: eventId });

  fetch(`${ASAAS_PROXY_URL}/meta/evento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      eventName: "Lead",
      eventId,
      eventTime,
      eventSourceUrl: window.location.href,
      userData: { telefone, nome, fbp: lerCookie("_fbp"), fbc: lerCookie("_fbc") },
      customData: { content_name: CONTENT_NAME },
    }),
  }).catch(() => {});
}
