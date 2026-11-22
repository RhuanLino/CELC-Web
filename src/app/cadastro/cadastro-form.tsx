"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, UserPlus } from "lucide-react";

const fieldClass =
  "rounded-xl border border-[#dcd5c4] bg-[#fdfcf8] px-4 py-3 text-base font-normal text-[#173f59] outline-none transition focus:border-[#0b5277] focus:ring-4 focus:ring-[#0b5277]/10";
const labelClass = "flex flex-col gap-2 text-sm font-semibold text-[#456372]";

const ESTADO_CIVIL = [
  { value: "SOLTEIRO", label: "Solteiro(a)" },
  { value: "CASADO", label: "Casado(a)" },
  { value: "DIVORCIADO", label: "Divorciado(a)" },
  { value: "VIUVO", label: "Viúvo(a)" },
  { value: "SEPARADO", label: "Separado(a)" },
  { value: "UNIAO_ESTAVEL", label: "União estável" },
];

const MEDIUM = [
  { value: "ALUNO", label: "Aluno" },
  { value: "INSTRUTOR", label: "Instrutor" },
  { value: "DIRIGENTE", label: "Dirigente" },
  { value: "PRONTO", label: "Pronto" },
  { value: "PASSISTA", label: "Passista" },
];

export function CadastroForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const senha = String(form.get("senha") ?? "");
    const confirmarSenha = String(form.get("confirmarSenha") ?? "");

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    const payload: Record<string, string> = {};
    form.forEach((value, key) => {
      if (key === "confirmarSenha") return;
      const text = typeof value === "string" ? value.trim() : "";
      if (text) payload[key] = text;
    });
    payload.senha = senha;

    setPending(true);

    try {
      const response = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setError(data?.message ?? "Não foi possível concluir o cadastro.");
        return;
      }

      router.replace("/login?cadastrado=1");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={`${labelClass} sm:col-span-2`}>
          Nome completo
          <input name="nome" type="text" autoComplete="name" required placeholder="Seu nome completo" className={fieldClass} />
        </label>

        <label className={labelClass}>
          Nome espiritual
          <input name="nomeEspiritual" type="text" placeholder="Opcional" className={fieldClass} />
        </label>

        <label className={labelClass}>
          Usuário
          <input name="username" type="text" autoComplete="username" required placeholder="Usuário de acesso" className={fieldClass} />
        </label>

        <label className={`${labelClass} sm:col-span-2`}>
          E-mail
          <input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" className={fieldClass} />
        </label>

        <label className={labelClass}>
          Senha
          <input name="senha" type="password" autoComplete="new-password" required minLength={6} placeholder="Mínimo de 6 caracteres" className={fieldClass} />
        </label>

        <label className={labelClass}>
          Confirmar senha
          <input name="confirmarSenha" type="password" autoComplete="new-password" required minLength={6} placeholder="Repita a senha" className={fieldClass} />
        </label>
      </div>

      <div className="border-t border-[#eee7d8] pt-5">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#a97818]">Dados pessoais</p>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            CPF
            <input name="cpf" type="text" inputMode="numeric" maxLength={11} placeholder="Somente números" className={fieldClass} />
          </label>

          <label className={labelClass}>
            RG
            <input name="rg" type="text" maxLength={9} placeholder="Opcional" className={fieldClass} />
          </label>

          <label className={labelClass}>
            Data de nascimento
            <input name="dataNascimento" type="date" className={fieldClass} />
          </label>

          <label className={labelClass}>
            Telefone
            <input name="telefone" type="tel" autoComplete="tel" placeholder="(00) 00000-0000" className={fieldClass} />
          </label>

          <label className={labelClass}>
            Estado civil
            <select name="estadoCivil" defaultValue="" className={fieldClass}>
              <option value="">Não informar</option>
              {ESTADO_CIVIL.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Quadro
            <select name="medium" defaultValue="" className={fieldClass}>
              <option value="">Não informar</option>
              {MEDIUM.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Cidade
            <input name="cidade" type="text" autoComplete="address-level2" placeholder="Sua cidade" className={fieldClass} />
          </label>

          <label className={labelClass}>
            UF
            <input name="uf" type="text" maxLength={2} autoComplete="address-level1" placeholder="GO" className={`${fieldClass} uppercase`} />
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-[#f0d2c9] bg-[#fff3ef] px-4 py-3 text-sm text-[#a44035]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#0b5277] px-6 py-3.5 font-bold text-white transition hover:bg-[#083f5c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        {pending ? "Cadastrando..." : "Criar conta"}
      </button>
    </form>
  );
}
