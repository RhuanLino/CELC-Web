import Link from "next/link";

export default function CaixaPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4ed] p-6 text-[#173f59]">
      <div className="max-w-lg text-center">
        <p className="eyebrow justify-center before:hidden">Módulo da livraria</p>
        <h1 className="mt-5 font-serif text-5xl">Caixa</h1>
        <p className="mt-5 leading-7 text-[#58717d]">Esta área está sendo preparada para a gestão da Livraria Humberto de Campos.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#173f59] px-6 py-3 font-bold text-white">Voltar para a C.E.L.C</Link>
      </div>
    </main>
  );
}
