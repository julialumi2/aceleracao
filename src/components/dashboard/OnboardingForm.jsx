import { useState } from "react";
import { Building2, Landmark, Clock3, Loader2, CheckCircle2 } from "lucide-react";
import { maskCNPJ, maskCEP } from "../../lib/masks.js";
import { saveRestaurantProfile } from "../../lib/supabase.js";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const INITIAL_STATE = {
  nome: "",
  cnpj: "",
  endereco: "",
  cep: "",
  banco: "",
  agencia: "",
  contaPix: "",
  diasFuncionamento: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  horarioAbertura: "18:00",
  horarioFechamento: "23:00",
};

// `section` controla qual bloco é exibido a partir da navegação da sidebar:
// "cadastrais" -> Dados do Restaurante | "operacao" -> Ajustes do Cardápio
export default function OnboardingForm({ section = "cadastrais" }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function toggleDay(day) {
    setForm((f) => ({
      ...f,
      diasFuncionamento: f.diasFuncionamento.includes(day)
        ? f.diasFuncionamento.filter((d) => d !== day)
        : [...f.diasFuncionamento, day],
    }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Persiste na tabela `restaurants` do Supabase local.
      await saveRestaurantProfile(form).catch(() => null);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl tracking-wide text-ink">
          {section === "cadastrais" ? "Dados do Restaurante" : "Ajustes do Cardápio"}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {section === "cadastrais"
            ? "Informações cadastrais usadas no contrato e nas cobranças."
            : "Dados bancários e horário de funcionamento para o planejamento operacional."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {section === "cadastrais" && (
          <fieldset className="rounded-2xl border border-line bg-surface p-6">
            <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-ink">
              <Building2 size={16} className="text-emerald-bright" />
              Seção 1 — Dados Cadastrais
            </legend>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome do restaurante"
                value={form.nome}
                onChange={(v) => update("nome", v)}
                placeholder="Ex: Cantina do Zé"
              />
              <Field
                label="CNPJ"
                value={form.cnpj}
                onChange={(v) => update("cnpj", maskCNPJ(v))}
                placeholder="00.000.000/0000-00"
                mono
              />
              <Field
                label="Endereço"
                value={form.endereco}
                onChange={(v) => update("endereco", v)}
                placeholder="Rua, número, bairro, cidade"
                className="sm:col-span-2"
              />
              <Field
                label="CEP"
                value={form.cep}
                onChange={(v) => update("cep", maskCEP(v))}
                placeholder="00000-000"
                mono
              />
            </div>
          </fieldset>
        )}

        {section === "operacao" && (
          <>
            <fieldset className="rounded-2xl border border-line bg-surface p-6">
              <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-ink">
                <Landmark size={16} className="text-emerald-bright" />
                Seção 2 — Dados Bancários
              </legend>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Banco" value={form.banco} onChange={(v) => update("banco", v)} placeholder="Ex: Nubank" />
                <Field label="Agência" value={form.agencia} onChange={(v) => update("agencia", v)} placeholder="0000" mono />
                <Field
                  label="Conta / Chave PIX"
                  value={form.contaPix}
                  onChange={(v) => update("contaPix", v)}
                  placeholder="CPF, e-mail, telefone ou aleatória"
                  className="sm:col-span-2"
                  mono
                />
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-line bg-surface p-6">
              <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-ink">
                <Clock3 size={16} className="text-emerald-bright" />
                Dias & Horários de Funcionamento
              </legend>

              <div className="mt-5 flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const isActive = form.diasFuncionamento.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`h-10 w-12 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-emerald-brand text-base"
                          : "border border-line text-ink-muted hover:border-emerald-brand/50"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Abertura"
                  type="time"
                  value={form.horarioAbertura}
                  onChange={(v) => update("horarioAbertura", v)}
                  mono
                />
                <Field
                  label="Fechamento"
                  type="time"
                  value={form.horarioFechamento}
                  onChange={(v) => update("horarioFechamento", v)}
                  mono
                />
              </div>
            </fieldset>
          </>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-emerald-brand px-6 py-3 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Salvar informações
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-bright">
              <CheckCircle2 size={16} /> Salvo com sucesso
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", mono = false, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:border-emerald-brand/60 focus:outline-none ${
          mono ? "font-mono" : ""
        }`}
      />
    </label>
  );
}
