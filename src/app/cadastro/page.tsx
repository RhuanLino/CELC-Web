import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";
import { CadastroForm } from "./cadastro-form";

export const metadata: Metadata = {
  title: "Cadastro | C.E.L.C",
  description: "Cadastro de novos obreiros nos módulos internos da Casa Espiritualista Luz do Caminho.",
};

export default async function CadastroPage() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (await verifyToken(token)) redirect("/livraria");

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
            <Sparkles className="size-4" /> Novo obreiro
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.08] tracking-[-.03em]">
            Faça parte da <em className="font-normal text-[#f7d878]">nossa casa.</em>
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/70">
            Cadastre-se para acessar os módulos internos com sua conta institucional.
          </p>
        </div>
        <p className="relative flex items-center gap-2 text-xs text-white/45">
          <BookOpen className="size-4" /> Livraria Humberto de Campos · Tesouraria
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#456372] hover:text-[#0b5277]">
            <ArrowLeft className="size-4" /> Voltar para o site
          </Link>

          <div className="mt-10 rounded-[2rem] border border-[#e5ddc9] bg-white p-8 shadow-[0_24px_80px_rgba(23,63,89,.12)] sm:p-10">
            <p className="text-xs font-black uppercase tracking-[.22em] text-[#a97818]">Cadastro interno</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#173f59]">Criar conta</h2>
            <p className="mt-3 text-sm leading-6 text-[#6c7d84]">
              Preencha seus dados para solicitar acesso à livraria e à tesouraria.
            </p>
            <CadastroForm />

            <p className="mt-6 text-center text-sm text-[#6c7d84]">
              Já possui uma conta?{" "}
              <Link href="/login" className="font-semibold text-[#0b5277] hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
