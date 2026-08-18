import { supabase } from "./supabase.js";

// Formulário público de onboarding (cadastro.aceleracao.artesanosburger.com.br)
// — pra quem já fechou a mentoria. Insere direto na tabela `restaurants`
// como cliente novo (não como lead). RLS trava todo campo financeiro no
// valor padrão (ver policy "Publico pode cadastrar cliente pelo formulario
// de onboarding"), então essa rota só consegue criar o cadastro básico —
// cobrança, Asaas e cancelamento continuam só configuráveis pela equipe.
export async function submitPublicOnboarding({
  nome,
  empresa,
  telefone,
  email,
  cnpj,
  endereco,
  cidade,
  cep,
  banco,
  agencia,
  conta,
  diasFuncionamento,
  horarioAbertura,
  horarioFechamento,
  horarioAberturaFds,
  horarioFechamentoFds,
}) {
  const { error } = await supabase.from("restaurants").insert({
    nome,
    empresa: empresa || null,
    telefone: telefone || null,
    email: email || null,
    cnpj: cnpj || null,
    endereco: endereco || null,
    cidade: cidade || null,
    cep: cep || null,
    banco: banco || null,
    agencia: agencia || null,
    conta: conta || null,
    dias_funcionamento: diasFuncionamento && diasFuncionamento.length ? diasFuncionamento : null,
    horario_abertura: horarioAbertura || null,
    horario_fechamento: horarioFechamento || null,
    horario_abertura_fds: horarioAberturaFds || null,
    horario_fechamento_fds: horarioFechamentoFds || null,
    saude: "laranja",
  });
  if (error) throw error;
}
