// Campos operacionais que o formulário público de cadastro pode
// preencher. Nunca inclui nada financeiro/de cobrança — isso é sempre
// decidido pela equipe, nunca pelo formulário público.
const CAMPOS_OPERACIONAIS = [
  "nome",
  "empresa",
  "telefone",
  "email",
  "cnpj",
  "endereco",
  "cidade",
  "cep",
  "banco",
  "agencia",
  "conta",
  "dias_funcionamento",
  "horario_abertura",
  "horario_fechamento",
  "horario_abertura_fds",
  "horario_fechamento_fds",
];

function normalizarTelefone(telefone) {
  return (telefone || "").replace(/\D/g, "");
}

function normalizarNome(nome) {
  return (nome || "").trim().toLowerCase();
}

function vazio(valor) {
  if (valor == null) return true;
  if (Array.isArray(valor)) return valor.length === 0;
  if (typeof valor === "string") return valor.trim().length === 0;
  return false;
}

// Acha um cliente já cadastrado (não arquivado) com o mesmo telefone ou
// o mesmo nome de empresa de quem está preenchendo o formulário — pra
// não duplicar quando um lead já convertido preenche o cadastro público.
export async function acharClienteExistente(supabase, { telefone, empresa }) {
  const telefoneNormalizado = normalizarTelefone(telefone);
  const empresaNormalizada = normalizarNome(empresa);

  const { data: candidatos, error } = await supabase
    .from("restaurants")
    .select(CAMPOS_OPERACIONAIS.join(",") + ",id")
    .is("arquivado_em", null);
  if (error) throw error;

  for (const candidato of candidatos || []) {
    const telefoneBate = telefoneNormalizado && normalizarTelefone(candidato.telefone) === telefoneNormalizado;
    const empresaBate = empresaNormalizada && normalizarNome(candidato.empresa) === empresaNormalizada;
    if (telefoneBate || empresaBate) return candidato;
  }
  return null;
}

// Só preenche o que já não estava preenchido — nunca sobrescreve dado
// que a equipe ou um cadastro anterior já colocou ali.
export function montarAtualizacaoMescla(clienteExistente, dadosFormulario) {
  const atualizacao = {};
  for (const campo of CAMPOS_OPERACIONAIS) {
    if (vazio(clienteExistente[campo]) && !vazio(dadosFormulario[campo])) {
      atualizacao[campo] = dadosFormulario[campo];
    }
  }
  return atualizacao;
}
