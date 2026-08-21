const GRAPH_VERSION = "v21.0";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

const APP_ID = process.env.INSTAGRAM_APP_ID;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;

export const INSTAGRAM_CONFIGURADO = Boolean(APP_ID && APP_SECRET && REDIRECT_URI);

// Escopos mínimos pra ler quantidade de posts e alcance da conta
// conectada — nada de mensagens, contatos ou dados de seguidores.
const SCOPES = ["instagram_basic", "instagram_manage_insights", "pages_show_list", "pages_read_engagement"].join(",");

export function montarUrlAutorizacao(restaurantId) {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    response_type: "code",
    state: restaurantId,
  });
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

async function graphFetch(path, params = {}) {
  const url = `${GRAPH_URL}${path}?${new URLSearchParams(params).toString()}`;
  const response = await fetch(url);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || `Meta respondeu ${response.status}`);
  }
  return data;
}

// Troca o "code" do redirect do OAuth por um token de usuário de curta
// duração, depois estende pra longa duração (~60 dias).
async function trocarCodePorTokenLongo(code) {
  const curto = await graphFetch("/oauth/access_token", {
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    client_secret: APP_SECRET,
    code,
  });

  const longo = await graphFetch("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: APP_ID,
    client_secret: APP_SECRET,
    fb_exchange_token: curto.access_token,
  });

  return longo; // { access_token, token_type, expires_in }
}

// A partir do token de usuário, acha a primeira Página com uma conta do
// Instagram profissional conectada, e devolve os dados prontos pra
// salvar (token da própria Página, que não expira enquanto o token de
// usuário que o gerou continuar válido).
async function acharContaInstagramConectada(userAccessToken) {
  const paginas = await graphFetch("/me/accounts", { access_token: userAccessToken, fields: "id,name,access_token" });

  for (const pagina of paginas.data || []) {
    const detalhe = await graphFetch(`/${pagina.id}`, {
      fields: "instagram_business_account",
      access_token: pagina.access_token,
    });
    if (detalhe.instagram_business_account) {
      const igUserId = detalhe.instagram_business_account.id;
      const igConta = await graphFetch(`/${igUserId}`, { fields: "username", access_token: pagina.access_token });
      return {
        pageId: pagina.id,
        pageAccessToken: pagina.access_token,
        instagramUserId: igUserId,
        instagramUsername: igConta.username,
      };
    }
  }

  return null;
}

// Fluxo completo pós-redirect: code -> token longo -> Página -> conta do
// Instagram. Lança erro claro se a conta não tiver Instagram profissional
// conectado a nenhuma Página (caso comum de configuração incompleta).
export async function processarCallback(code) {
  const tokenLongo = await trocarCodePorTokenLongo(code);
  const conta = await acharContaInstagramConectada(tokenLongo.access_token);

  if (!conta) {
    throw new Error(
      "Nenhuma conta profissional do Instagram encontrada conectada a uma Página do Facebook. " +
        "A conta do Instagram precisa ser Comercial ou Criador de Conteúdo, e estar vinculada a uma Página do Facebook."
    );
  }

  return {
    instagramUserId: conta.instagramUserId,
    instagramUsername: conta.instagramUsername,
    pageId: conta.pageId,
    accessToken: conta.pageAccessToken,
    tokenExpiresAt: new Date(Date.now() + tokenLongo.expires_in * 1000).toISOString(),
  };
}

// Quantidade de posts nos últimos `dias` dias + alcance da conta no
// mesmo período.
export async function buscarMetricas({ instagramUserId, accessToken }, dias = 7) {
  const desde = Math.floor((Date.now() - dias * 24 * 60 * 60 * 1000) / 1000);

  const media = await graphFetch(`/${instagramUserId}/media`, {
    fields: "timestamp",
    limit: "100",
    access_token: accessToken,
  });
  const posts = (media.data || []).filter((m) => new Date(m.timestamp).getTime() / 1000 >= desde);

  let alcance = null;
  try {
    const insights = await graphFetch(`/${instagramUserId}/insights`, {
      metric: "reach",
      period: "day",
      since: String(desde),
      until: String(Math.floor(Date.now() / 1000)),
      access_token: accessToken,
    });
    const valores = insights.data?.[0]?.values || [];
    alcance = valores.reduce((soma, v) => soma + (v.value || 0), 0);
  } catch {
    // Conta pode não ter volume suficiente pra métrica de alcance —
    // segue sem quebrar a contagem de posts, que é o essencial.
  }

  return { totalPosts: posts.length, alcance, periodoDias: dias, atualizadoEm: new Date().toISOString() };
}
