// Dados de demonstração para o painel funcionar de ponta a ponta sem
// depender do Supabase local estar de pé. Estrutura já espelha as tabelas
// criadas em supabase/migrations/20260810010000_create_admin_tables.sql
// (boletos/histórico entram como novas tabelas quando isso for pra produção).

export const INITIAL_CLIENTS = [
  {
    id: "c1",
    nome: "Cantina do Zé",
    cnpj: "12.345.678/0001-99",
    endereco: "Rua das Palmeiras, 210 — São Paulo/SP",
    telefone: "5511999990001",
    email: "contato@cantinadoze.com.br",
    cardapioUrl: "https://cardapio.salacheia.com.br/cantina-do-ze",
    // verde = rodando e dando resultado | amarelo = rodando, sem resultado ainda | laranja = ainda não começou
    saude: "verde",
    contrato: {
      status: "assinado",
      documentoUrl: "",
      assinadoEm: "2026-06-02",
      historico: [
        { id: "h1", data: "2026-05-28", evento: "Contrato enviado via Clicksign" },
        { id: "h2", data: "2026-06-02", evento: "Contrato assinado pelo cliente" },
      ],
    },
    boletos: [
      { id: "b1", valor: 997, vencimento: "2026-07-05", status: "pago", alertaEnviadoEm: null },
      { id: "b2", valor: 997, vencimento: "2026-08-05", status: "pago", alertaEnviadoEm: null },
      { id: "b3", valor: 997, vencimento: "2026-09-05", status: "pendente", alertaEnviadoEm: null },
    ],
    intensidade: {
      status: "ativo",
      observacao: "Postagens regulares, bom engajamento.",
      atualizadoEm: "2026-08-01",
      historico: [
        { id: "i1", data: "2026-07-15", status: "ativo", observacao: "Engajamento estável.", mensagemEnviada: false },
        { id: "i2", data: "2026-08-01", status: "ativo", observacao: "Postagens regulares, bom engajamento.", mensagemEnviada: false },
      ],
    },
  },
  {
    id: "c2",
    nome: "Sabor & Cia",
    cnpj: "98.765.432/0001-10",
    endereco: "Av. Beira Mar, 780 — Recife/PE",
    telefone: "5581999990002",
    email: "financeiro@saborecia.com.br",
    cardapioUrl: "",
    saude: "amarelo",
    contrato: {
      status: "pendente",
      documentoUrl: "",
      assinadoEm: null,
      historico: [{ id: "h1", data: "2026-08-01", evento: "Contrato enviado via Clicksign" }],
    },
    boletos: [
      { id: "b1", valor: 997, vencimento: "2026-06-28", status: "pago", alertaEnviadoEm: null },
      { id: "b2", valor: 997, vencimento: "2026-07-28", status: "atrasado", alertaEnviadoEm: null },
    ],
    intensidade: {
      status: "em_queda",
      observacao: "Sem posts há 12 dias.",
      atualizadoEm: "2026-08-04",
      historico: [
        { id: "i1", data: "2026-07-20", status: "ativo", observacao: "Ritmo normal de postagens.", mensagemEnviada: false },
        { id: "i2", data: "2026-08-04", status: "em_queda", observacao: "Sem posts há 12 dias.", mensagemEnviada: false },
      ],
    },
  },
  {
    id: "c3",
    nome: "Brasa Alta Churrascaria",
    cnpj: "45.678.912/0001-33",
    endereco: "Rua dos Grelhados, 88 — Belo Horizonte/MG",
    telefone: "5531999990003",
    email: "gerencia@brasaalta.com.br",
    cardapioUrl: "https://cardapio.salacheia.com.br/brasa-alta",
    saude: "verde",
    contrato: {
      status: "assinado",
      documentoUrl: "",
      assinadoEm: "2026-05-14",
      historico: [
        { id: "h1", data: "2026-05-10", evento: "Contrato enviado via Clicksign" },
        { id: "h2", data: "2026-05-14", evento: "Contrato assinado pelo cliente" },
      ],
    },
    boletos: [
      { id: "b1", valor: 1497, vencimento: "2026-07-15", status: "pago", alertaEnviadoEm: null },
      { id: "b2", valor: 1497, vencimento: "2026-08-15", status: "pendente", alertaEnviadoEm: null },
    ],
    intensidade: {
      status: "ativo",
      observacao: "Boa recorrência de stories.",
      atualizadoEm: "2026-08-03",
      historico: [{ id: "i1", data: "2026-08-03", status: "ativo", observacao: "Boa recorrência de stories.", mensagemEnviada: false }],
    },
  },
  {
    id: "c4",
    nome: "Empório Verde Vida",
    cnpj: "11.222.333/0001-44",
    endereco: "Rua das Acácias, 45 — Curitiba/PR",
    telefone: "5541999990004",
    email: "oi@emporioverdevida.com.br",
    cardapioUrl: "",
    saude: "laranja",
    contrato: {
      status: "pendente",
      documentoUrl: "",
      assinadoEm: null,
      historico: [{ id: "h1", data: "2026-07-30", evento: "Contrato enviado via Clicksign" }],
    },
    boletos: [{ id: "b1", valor: 497, vencimento: "2026-07-20", status: "atrasado", alertaEnviadoEm: null }],
    intensidade: {
      status: "inativo",
      observacao: "Sem atividade há 30 dias.",
      atualizadoEm: "2026-08-02",
      historico: [{ id: "i1", data: "2026-08-02", status: "inativo", observacao: "Sem atividade há 30 dias.", mensagemEnviada: false }],
    },
  },
  {
    id: "c5",
    nome: "Pizzaria Napolitana",
    cnpj: "22.333.444/0001-55",
    endereco: "Rua Itália, 120 — Porto Alegre/RS",
    telefone: "5551999990005",
    email: "contato@napolitana.com.br",
    cardapioUrl: "https://cardapio.salacheia.com.br/napolitana",
    saude: "amarelo",
    contrato: {
      status: "assinado",
      documentoUrl: "",
      assinadoEm: "2026-04-22",
      historico: [
        { id: "h1", data: "2026-04-18", evento: "Contrato enviado via Clicksign" },
        { id: "h2", data: "2026-04-22", evento: "Contrato assinado pelo cliente" },
      ],
    },
    boletos: [
      { id: "b1", valor: 997, vencimento: "2026-07-10", status: "pago", alertaEnviadoEm: null },
      { id: "b2", valor: 997, vencimento: "2026-08-10", status: "pago", alertaEnviadoEm: null },
    ],
    intensidade: {
      status: "ativo",
      observacao: "Campanha de reels performando bem.",
      atualizadoEm: "2026-08-05",
      historico: [{ id: "i1", data: "2026-08-05", status: "ativo", observacao: "Campanha de reels performando bem.", mensagemEnviada: false }],
    },
  },
];

export const INITIAL_LEADS = [
  {
    id: "l1",
    nome: "Restaurante Ponto Certo",
    email: "contato@pontocerto.com.br",
    telefone: "5511988880001",
    origem: "google_forms",
    status: "novo",
    criadoEm: "2026-08-08",
  },
  {
    id: "l2",
    nome: "Boteco da Esquina",
    email: "boteco@daesquina.com.br",
    telefone: "5521988880002",
    origem: "google_forms",
    status: "contatado",
    criadoEm: "2026-08-06",
  },
  {
    id: "l3",
    nome: "Sushi Yama",
    email: "contato@sushiyama.com.br",
    telefone: "5531988880003",
    origem: "google_forms",
    status: "novo",
    criadoEm: "2026-08-09",
  },
];
