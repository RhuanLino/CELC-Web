"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole } from "lucide-react";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), senha: form.get("senha") }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setError(data?.message ?? "Não foi possível entrar.");
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#456372]">
        Usuário
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          placeholder="Seu usuário"
          className="rounded-xl border border-[#dcd5c4] bg-[#fdfcf8] px-4 py-3 text-base font-normal text-[#173f59] outline-none transition focus:border-[#0b5277] focus:ring-4 focus:ring-[#0b5277]/10"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-[#456372]">
        Senha
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Sua senha"
          className="rounded-xl border border-[#dcd5c4] bg-[#fdfcf8] px-4 py-3 text-base font-normal text-[#173f59] outline-none transition focus:border-[#0b5277] focus:ring-4 focus:ring-[#0b5277]/10"
        />
      </label>

      {error && <p role="alert" className="rounded-xl border border-[#f0d2c9] bg-[#fff3ef] px-4 py-3 text-sm text-[#a44035]">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#0b5277] px-6 py-3.5 font-bold text-white transition hover:bg-[#083f5c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
