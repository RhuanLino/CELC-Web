"use client";

import { useEffect, useState } from "react";

type Produto = { id: string; nome: string; categoria: string; preco: number; estoque: number };

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState({ nome: "", categoria: "", preco: "", estoque: "" });

  const carregar = () => fetch("/api/produtos").then((r) => r.json()).then(setProdutos);

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.nome,
        categoria: form.categoria,
        preco: parseFloat(form.preco),
        estoque: parseInt(form.estoque),
      }),
    });
    setForm({ nome: "", categoria: "", preco: "", estoque: "" });
    carregar();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Produtos</h2>

      <div className="flex gap-2 mb-6">
        <input placeholder="Nome" className="border rounded px-3 py-2" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <input placeholder="Categoria" className="border rounded px-3 py-2" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
        <input placeholder="Preço" type="number" className="border rounded px-3 py-2" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
        <input placeholder="Estoque" type="number" className="border rounded px-3 py-2" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: e.target.value })} />
        <button onClick={salvar} className="bg-gray-900 text-white px-4 rounded">Adicionar</button>
      </div>

      <table className="w-full bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left text-sm">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">Categoria</th>
            <th className="p-3">Preço</th>
            <th className="p-3">Estoque</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id} className="border-t text-sm">
              <td className="p-3">{p.nome}</td>
              <td className="p-3">{p.categoria}</td>
              <td className="p-3">R$ {p.preco.toFixed(2)}</td>
              <td className="p-3">{p.estoque}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}