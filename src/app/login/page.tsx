import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { AUTH_COOKIE, safeNextPath, verifyToken } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar | C.E.L.C",
  description: "Acesso aos módulos internos da Casa Espiritualista Luz do Caminho.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; cadastrado?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const cadastrado = params.cadastrado === "1";
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  if (await verifyToken(token)) redirect(next);

  return (
    <main className="grid min-h-screen bg-[#f7f4ed] lg:grid-cols-[1.1fr_.9fr]">
      <section className="relative hidden overflow-hidden bg-[#083754] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <Image src="/celc-hero.jpg" alt="" fill priority className="object-cover opacity-25" sizes="55vw" />
        <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(4,37,57,.94),rgba(7,53,80,.75))]" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-full bg-white/95">
            <Image src="/celc-logo.png" alt="Símbolo da C.E.L.C" width={32} height={49} priority />
          </span>
          <span>
            <strong className="block font-serif text-2xl leading-none tracking-[.14em]">C.E.L.C</strong>
            <span className="mt-1 block text-[10px] uppercase tracking-[.18em] text-white/70">
              Casa Espiritualista Luz do Caminho
            </span>
          </span>
        </div>
        <div className="relative max-w-lg">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.24em] text-[#f5c95b]">
            <Sparkles className="size-4" /> Área restrita
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.08] tracking-[-.03em]">
            Trabalho e concórdia <em className="font-normal text-[#f7d878]">a todo custo.</em>
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/70">
            Acesse os módulos internos da casa com sua conta institucional.
          </p>
        </div>
        <p className="relative flex items-center gap-2 text-xs text-white/45">
          <BookOpen className="size-4" /> Livraria Humberto de Campos · Tesouraria
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#456372] hover:text-[#0b5277]">
            <ArrowLeft className="size-4" /> Voltar para o site
          </Link>

          <div className="mt-10 rounded-[2rem] border border-[#e5ddc9] bg-white p-8 shadow-[0_24px_80px_rgba(23,63,89,.12)] sm:p-10">
            <p className="text-xs font-black uppercase tracking-[.22em] text-[#a97818]">Acesso interno</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#173f59]">Entrar na conta</h2>
            <p className="mt-3 text-sm leading-6 text-[#6c7d84]">
              Informe suas credenciais para acessar a livraria e a tesouraria.
            </p>
            {cadastrado && (
              <p role="status" className="mt-5 rounded-xl border border-[#cfe6d3] bg-[#eef7ef] px-4 py-3 text-sm text-[#2f6b3a]">
                Cadastro realizado com sucesso! Faça login para continuar.
              </p>
            )}
            <LoginForm next={next} />
            <p className="mt-6 text-center text-sm text-[#6c7d84]">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-semibold text-[#0b5277] hover:underline">
                Criar cadastro
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
