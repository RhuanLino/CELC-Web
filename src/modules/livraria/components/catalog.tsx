"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Search, Trash2, Package, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { bookstoreService } from "../service";
import { loadProductLookups, productService } from "../product-service";
import { money, errorMessage } from "../format";
import type { Customer, Product, ProductInput, ProductLookups } from "../types";
import { EmptyState, Metric, Modal, Notice, PageHeading, useBookstoreData } from "./shared";

const loadCatalog = async () => ({ products: await productService.list(), customers: await bookstoreService.customers.list() });
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const displayName = (row: Product | Customer) => ("nome" in row ? row.nome : row.name);

export function CatalogPage({ kind }: { kind: "products" | "customers" }) {
  const isProduct = kind === "products";
  const { data, error, reload } = useBookstoreData(loadCatalog);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Product | Customer | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | Customer | null>(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const rows = (isProduct ? data?.products : data?.customers) ?? [];
  const visible = rows.filter((row) => {
    const haystack =
      "codigoBarras" in row
        ? `${row.nome} ${row.codigoBarras} ${row.isbn} ${row.autorNome} ${row.marcaNome}`
        : `${row.name} ${row.email} ${row.phone}`;
    const matchesCategory = !isProduct || !category || ("categoriaNome" in row && row.categoriaNome === category);
    return normalize(haystack).includes(normalize(search)) && matchesCategory;
  });
  const categories = [...new Set((data?.products ?? []).map((p) => p.categoriaNome).filter(Boolean))];

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true); setActionError("");
    try {
      if (isProduct) await productService.remove(deleting.id);
      else await bookstoreService.customers.remove(deleting.id);
      setDeleting(null); setMessage("Cadastro excluído com sucesso."); await reload();
    } catch (err) { setActionError(errorMessage(err)); } finally { setBusy(false); }
  }

  return <>
    <PageHeading
      title={isProduct ? "Produtos" : "Clientes"}
      description={isProduct ? "Cada livro, uma nova possibilidade. Cuide do seu acervo por aqui." : "Pessoas que fazem parte da nossa história. Mantenha os cadastros por perto."}
      action={<button className="book-button primary" onClick={() => setEditing("new")}><Plus size={18} />{isProduct ? "Novo produto" : "Novo cliente"}</button>}
    />
    <div className="metric-grid three">
      <Metric label={isProduct ? "Produtos cadastrados" : "Clientes cadastrados"} value={String(rows.length).padStart(2, "0")} note={isProduct ? "Títulos e itens do acervo" : "Relacionamentos que cultivamos"} icon={isProduct ? <Package size={21} /> : <Users size={21} />} />
      <Metric label={isProduct ? "Unidades em estoque" : "Com telefone"} value={String(isProduct ? data?.products.reduce((n, p) => n + p.estoque, 0) ?? 0 : data?.customers.filter((c) => c.phone).length ?? 0)} note={isProduct ? "Prontas para encontrar um leitor" : "Contato disponível no cadastro"} />
      <Metric label={isProduct ? "Estoque baixo" : "Com e-mail"} value={String(isProduct ? data?.products.filter((p) => p.estoque <= 3).length ?? 0 : data?.customers.filter((c) => c.email).length ?? 0).padStart(2, "0")} note={isProduct ? "Produtos com até 3 unidades" : "Endereços de e-mail cadastrados"} warm />
    </div>
    {message && <Notice success>{message}</Notice>}{error && <Notice>{error}</Notice>}
    <section className="book-panel">
      <div className="panel-heading">
        <div><h2>{isProduct ? "Acervo da livraria" : "Todos os clientes"}</h2><p>{isProduct ? "Organize os produtos e acompanhe a disponibilidade." : "Consulte os contatos e gerencie os dados de cada cliente."}</p></div>
        <span className="count-badge">{visible.length} {isProduct ? "produtos" : "clientes"}</span>
      </div>
      <div className="table-toolbar">
        <label className="search-box">
          <Search size={18} />
          <input aria-label={isProduct ? "Buscar produtos" : "Buscar clientes"} placeholder={isProduct ? "Buscar por título, categoria, código ou ISBN..." : "Buscar por nome, telefone ou e-mail..."} value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        {isProduct && <select aria-label="Filtrar por categoria" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Todas as categorias</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>}
      </div>
      {!data ? <div className="loading-state" role="status">Carregando cadastros…</div> : visible.length === 0 ? <EmptyState title="Nenhum cadastro encontrado" description="Experimente outra busca ou adicione um novo cadastro." /> : (
        <div className="table-scroll">
          <table className="book-table">
            <thead><tr><th>{isProduct ? "Produto" : "Cliente"}</th><th>{isProduct ? "Categoria" : "Telefone"}</th><th>{isProduct ? "Preço de venda" : "E-mail"}</th><th>{isProduct ? "Estoque" : "Observações"}</th><th className="align-right">Ações</th></tr></thead>
            <tbody>
              {visible.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <div className="entity-cell">
                      <span className={`entity-avatar tone-${index % 4}`}>{"codigoBarras" in row ? <Package size={20} strokeWidth={1.5} /> : row.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}</span>
                      <div>
                        <strong>{displayName(row)}</strong>
                        <small>{"codigoBarras" in row ? `${row.autorNome || "Sem autor"} · ${row.codigoBarras}` : "Cliente da livraria"}</small>
                      </div>
                    </div>
                  </td>
                  <td>{"categoriaNome" in row ? <span className="category-tag">{row.categoriaNome || "—"}</span> : row.phone || "—"}</td>
                  <td>{"preco" in row ? <strong>{money(row.preco)}</strong> : row.email || "—"}</td>
                  <td>{"estoque" in row ? <span className={`stock-tag ${row.estoque <= 3 ? "low" : ""}`}><span />{row.estoque === 0 ? "Sem estoque" : `${row.estoque} un.`}</span> : <span className="notes-cell" title={row.notes}>{row.notes || "—"}</span>}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-button" aria-label={`Editar ${displayName(row)}`} onClick={() => setEditing(row)}><Pencil size={16} /></button>
                      <button className="icon-button danger" aria-label={`Excluir ${displayName(row)}`} onClick={() => { setActionError(""); setDeleting(row); }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="table-bottom"><span>{visible.length} de {rows.length} cadastros</span><Link href="/caixa">Ir para o caixa <ArrowUpRight size={15} /></Link></div>
    </section>
    {editing && <Editor kind={kind} row={editing} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); setMessage("Cadastro salvo com sucesso."); await reload(); }} />}
    {deleting && (
      <Modal title="Excluir cadastro?" onClose={() => { if (!busy) setDeleting(null); }}>
        <p className="dialog-copy">O cadastro de <strong>{displayName(deleting)}</strong> será removido. As vendas já registradas manterão seus dados históricos.</p>
        {actionError && <Notice>{actionError}</Notice>}
        <div className="dialog-actions"><button className="book-button" onClick={() => setDeleting(null)} disabled={busy}>Cancelar</button><button className="book-button destructive" onClick={remove} disabled={busy}>{busy ? "Excluindo…" : "Excluir cadastro"}</button></div>
      </Modal>
    )}
  </>;
}

function Editor({ kind, row, onClose, onSaved }: { kind: "products" | "customers"; row: Product | Customer | "new"; onClose: () => void; onSaved: () => Promise<void> }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [lookups, setLookups] = useState<ProductLookups | null>(null);
  const [lookupsError, setLookupsError] = useState("");
  const isProduct = kind === "products";
  const product = row !== "new" && "codigoBarras" in row ? row : undefined;
  const customer = row !== "new" && "phone" in row ? row : undefined;

  useEffect(() => {
    if (!isProduct) return;
    let active = true;
    loadProductLookups()
      .then((value) => { if (active) setLookups(value); })
      .catch((err) => { if (active) setLookupsError(errorMessage(err)); });
    return () => { active = false; };
  }, [isProduct]);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return; setBusy(true); setError("");
    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const optionName = (options: ProductLookups[keyof ProductLookups] | undefined, id: string) => options?.find((option) => option.id === id)?.nome ?? "";
    try {
      if (isProduct) {
        if (!lookups) throw new Error("Aguarde o carregamento das opções do cadastro.");
        const categoriaId = text("categoriaId"), marcaId = text("marcaId"), generoId = text("generoId"), espiritoId = text("espiritoId"), autorId = text("autorId");
        const input: ProductInput = {
          codigoBarras: text("codigoBarras"),
          nome: text("nome"),
          descricao: text("descricao"),
          preco: Number(text("preco")),
          estoque: Number(text("estoque")),
          validade: text("validade"),
          isbn: text("isbn"),
          categoriaId, categoriaNome: optionName(lookups.categorias, categoriaId),
          marcaId, marcaNome: optionName(lookups.marcas, marcaId),
          generoId, generoNome: optionName(lookups.generos, generoId),
          espiritoId, espiritoNome: optionName(lookups.espiritos, espiritoId),
          autorId, autorNome: optionName(lookups.autores, autorId),
        };
        if (row === "new") await productService.create(input); else await productService.update(row.id, input);
      } else {
        const input = { name: text("name"), email: text("email"), phone: text("phone"), notes: text("notes") };
        if (row === "new") await bookstoreService.customers.create(input); else await bookstoreService.customers.update(row.id, input);
      }
      await onSaved();
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  }

  const canSubmit = !isProduct || Boolean(lookups);
  return (
    <Modal title={`${row === "new" ? "Novo" : "Editar"} ${isProduct ? "produto" : "cliente"}`} description="Os campos com * são obrigatórios." onClose={() => { if (!busy) onClose(); }}>
      <form onSubmit={save} className="book-form">
        {isProduct ? <>
          <label>Nome do produto *<input autoFocus name="nome" required minLength={2} maxLength={160} defaultValue={product?.nome} placeholder="Ex.: O Livro dos Espíritos" /></label>
          <label>Descrição<textarea name="descricao" rows={3} maxLength={255} defaultValue={product?.descricao} placeholder="Breve descrição do produto" /></label>
          <div className="form-grid">
            <label>Código de barras *<input name="codigoBarras" required inputMode="numeric" pattern="[0-9]+" maxLength={20} defaultValue={product?.codigoBarras} placeholder="9788573280031" /></label>
            <label>ISBN<input name="isbn" inputMode="numeric" pattern="[0-9]*" maxLength={20} defaultValue={product?.isbn} placeholder="9788573280031" /></label>
            <label>Preço de venda (R$) *<input name="preco" type="number" required min="0" max="999999" step="0.01" defaultValue={product?.preco} placeholder="0,00" /></label>
            <label>Unidades em estoque *<input name="estoque" type="number" required min="0" step="1" defaultValue={product?.estoque ?? 0} /></label>
            <label>Validade<input name="validade" type="date" defaultValue={product?.validade} /></label>
            <label>Categoria *<select name="categoriaId" required defaultValue={product?.categoriaId ?? ""} disabled={!lookups}><option value="">Selecione</option>{lookups?.categorias.map((option) => <option key={option.id} value={option.id}>{option.nome}</option>)}</select></label>
            <label>Marca *<select name="marcaId" required defaultValue={product?.marcaId ?? ""} disabled={!lookups}><option value="">Selecione</option>{lookups?.marcas.map((option) => <option key={option.id} value={option.id}>{option.nome}</option>)}</select></label>
            <label>Gênero<select name="generoId" defaultValue={product?.generoId ?? ""} disabled={!lookups}><option value="">Não informado</option>{lookups?.generos.map((option) => <option key={option.id} value={option.id}>{option.nome}</option>)}</select></label>
            <label>Espírito<select name="espiritoId" defaultValue={product?.espiritoId ?? ""} disabled={!lookups}><option value="">Não informado</option>{lookups?.espiritos.map((option) => <option key={option.id} value={option.id}>{option.nome}</option>)}</select></label>
            <label>Autor<select name="autorId" defaultValue={product?.autorId ?? ""} disabled={!lookups}><option value="">Não informado</option>{lookups?.autores.map((option) => <option key={option.id} value={option.id}>{option.nome}</option>)}</select></label>
          </div>
          {!lookups && !lookupsError && <div className="loading-state" role="status">Carregando opções…</div>}
          {lookupsError && <Notice>{lookupsError}</Notice>}
        </> : <>
          <label>Nome completo *<input autoFocus name="name" required minLength={2} maxLength={160} defaultValue={customer?.name} placeholder="Ex.: Ana Oliveira" /></label>
          <div className="form-grid">
            <label>Telefone com DDD<input name="phone" type="tel" maxLength={25} defaultValue={customer?.phone} placeholder="(61) 99999-0000" /></label>
            <label>E-mail<input name="email" type="email" maxLength={160} defaultValue={customer?.email} placeholder="nome@exemplo.com" /></label>
          </div>
          <label>Observações<textarea name="notes" rows={3} maxLength={500} defaultValue={customer?.notes} placeholder="Informações úteis para o atendimento" /></label>
        </>}
        {error && <Notice>{error}</Notice>}
        <div className="dialog-actions"><button type="button" className="book-button" onClick={onClose} disabled={busy}>Cancelar</button><button className="book-button primary" disabled={busy || !canSubmit}>{busy ? "Salvando…" : "Salvar cadastro"}</button></div>
      </form>
    </Modal>
  );
}
