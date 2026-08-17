import { supabase } from "./supabase.js";

// Formulário público (link na bio do Instagram / tráfego pago) — grava
// direto na tabela `leads`, sem passar pela equipe. RLS só permite
// insert anônimo com status = 'novo' (ver policy "Publico pode
// cadastrar lead pelo formulario"), então não dá pra ler, alterar ou
// apagar leads já existentes por aqui.
export async function submitPublicLead({
  nome,
  telefone,
  nomeNegocio,
  faturamentoMensal,
  maiorGargalo,
  gestorTrafego,
  mensagem,
  origem,
}) {
  const { error } = await supabase.from("leads").insert({
    nome,
    telefone: telefone || null,
    nome_negocio: nomeNegocio || null,
    faturamento_mensal: faturamentoMensal || null,
    maior_gargalo: maiorGargalo || null,
    gestor_trafego: gestorTrafego || null,
    mensagem: mensagem || null,
    origem: origem || "bio_instagram",
    status: "novo",
  });
  if (error) throw error;
}
