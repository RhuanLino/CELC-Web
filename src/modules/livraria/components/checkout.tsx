"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Banknote, BookOpen, Check, CheckCircle2, Clock3, CreditCard, Minus, Plus, QrCode, Search, ShoppingBag, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { bookstoreService, localDate } from "../service";
import { money, paymentLabels, errorMessage } from "../format";
import type { PaymentMethod, Product, Sale } from "../types";
import { EmptyState, Modal, Notice, PageHeading, useBookstoreData } from "./shared";
import { SaleReceipt } from "./sales";

const loadCheckout = async () => ({ products: await bookstoreService.products.list(), customers: await bookstoreService.customers.list() });
const paymentOptions = [{ method: "pix", icon: QrCode, label: "Pix" }, { method: "credit", icon: CreditCard, label: "Crédito" }, { method: "debit", icon: CreditCard, label: "Débito" }, { method: "cash", icon: Banknote, label: "Dinheiro" }, { method: "on_account", icon: Clock3, label: "A prazo" }] as const;

export function CheckoutPage() {
  const { data, error: loadError, reload } = useBookstoreData(loadCheckout);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [received, setReceived] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState<Sale | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const paymentRef = useRef<HTMLButtonElement>(null);
  const submitting = useRef(false);
  const total = cart.reduce((sum, item) => sum + Math.round(item.product.price * 100) * item.quantity, 0) / 100;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const query = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const results = data?.products.filter((p) => `${p.name} ${p.author} ${p.sku}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(query)) ?? [];
  useEffect(() => {
    function keyboard(e: KeyboardEvent) {
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "F2") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "F8") { e.preventDefault(); paymentRef.current?.click(); }
    }
    window.addEventListener("keydown", keyboard); return () => window.removeEventListener("keydown", keyboard);
  }, []);
  function add(product: Product) {
    if (busy) return;
    const quantity = cart.find((item) => item.product.id === product.id)?.quantity ?? 0;
    if (quantity >= product.stock) { setError(`Todas as ${product.stock} unidades de ${product.name} já estão na venda.`); return; }
    setError("");
    setCart((current) => quantity ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { product, quantity: 1 }]);
  }
  function quantity(productId: string, value: number) {
    const item = cart.find((item) => item.product.id === productId);
    if (!item || !Number.isInteger(value) || value < 1 || value > item.product.stock) { setError("Use uma quantidade inteira entre 1 e o estoque disponível."); return; }
    setError(""); setCart((current) => current.map((item) => item.product.id === productId ? { ...item, quantity: value } : item));
  }
  function reset() { setCart([]); setCustomerId(""); setMethod("pix"); setReceived(""); setDueDate(""); setError(""); setSearch(""); }
  async function finish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (submitting.current || !cart.length) return;
    submitting.current = true; setBusy(true); setError("");
    try {
      const sale = await bookstoreService.sales.create({ customerId: customerId || null, items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })), payment: { method, ...(method === "cash" ? { amountTendered: received === "" ? undefined : Number(received) } : {}), ...(method === "on_account" ? { dueDate } : {}) } });
      reset(); setCompleted(sale); await reload();
    } catch (err) { setError(errorMessage(err)); } finally { submitting.current = false; setBusy(false); }
  }
  return <><PageHeading eyebrow="PONTO DE VENDA" title="Frente de caixa" description="Um bom encontro começa com uma boa leitura." action={<span className="ready-badge"><span/> Pronto para atender</span>}/>
    {(error || loadError) && <Notice>{error || loadError}</Notice>}
    <div className="checkout-grid"><div className="checkout-left"><section className="book-panel product-picker"><div className="panel-heading"><div><h2>Adicionar produtos</h2><p>Busque pelo título, autor ou código do produto.</p></div><kbd>F2</kbd></div><form className="checkout-search" onSubmit={(e) => { e.preventDefault(); const exact = results.find((p) => p.sku.toLowerCase() === search.trim().toLowerCase()); if (exact || results.length === 1) { add(exact ?? results[0]); setSearch(""); } }}><label className="search-box"><Search size={20}/><input ref={searchRef} aria-label="Buscar produto no caixa" placeholder="Digite o nome ou leia o código…" value={search} onChange={(e) => setSearch(e.target.value)} disabled={busy}/></label></form><div className="picker-label"><span>{search ? "RESULTADOS DA BUSCA" : "ACESSO RÁPIDO AO ACERVO"}</span><small>{results.length} produtos</small></div><div className="product-grid">{results.map((p, index) => <button type="button" className="product-card" key={p.id} onClick={() => add(p)} disabled={busy || p.stock === 0 || (cart.find((i) => i.product.id === p.id)?.quantity ?? 0) >= p.stock} aria-label={`Adicionar ${p.name}`}><span className={`mini-cover tone-${index % 4}`}><BookOpen size={21} strokeWidth={1.3}/><small>{p.category}</small></span><span className="product-card-info"><strong>{p.name}</strong><small>{p.author}</small><span><b>{money(p.price)}</b><span className="product-add">{p.stock === 0 ? "Esgotado" : <Plus size={15}/>}</span></span></span></button>)}</div>{!data && <div className="loading-state">Carregando produtos…</div>}{data && results.length === 0 && <EmptyState title="Produto não encontrado" description="Confira o título ou o código informado."/>}</section>
    <section className="book-panel cart-panel"><div className="panel-heading"><div className="cart-heading"><ShoppingBag size={19}/><h2>Itens da venda</h2><span className="count-badge">{count}</span></div><button className="text-button danger" disabled={!cart.length || busy} onClick={() => setCancelOpen(true)}><Trash2 size={14}/> Limpar venda</button></div>{cart.length === 0 ? <EmptyState title="Vamos começar uma nova história?" description="Selecione um produto acima para iniciar a venda."/> : <div className="table-scroll"><table className="book-table cart-table"><thead><tr><th>Produto</th><th>Valor un.</th><th>Quantidade</th><th>Subtotal</th><th><span className="sr-only">Remover</span></th></tr></thead><tbody>{cart.map(({ product: p, quantity: qty }, index) => <tr key={p.id}><td><div className="cart-product"><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{p.name}</strong><small>{p.sku} · {p.stock} disponíveis</small></div></div></td><td>{money(p.price)}</td><td><div className="quantity-control"><button aria-label={`Diminuir ${p.name}`} disabled={qty <= 1 || busy} onClick={() => quantity(p.id, qty - 1)}><Minus size={13}/></button><input aria-label={`Quantidade de ${p.name}`} type="number" min="1" max={p.stock} value={qty} disabled={busy} onChange={(e) => quantity(p.id, Number(e.target.value))}/><button aria-label={`Aumentar ${p.name}`} disabled={qty >= p.stock || busy} onClick={() => quantity(p.id, qty + 1)}><Plus size={13}/></button></div></td><td><strong>{money(Math.round(p.price * 100) * qty / 100)}</strong></td><td><button className="icon-button danger" aria-label={`Remover ${p.name}`} disabled={busy} onClick={() => setCart((items) => items.filter((i) => i.product.id !== p.id))}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>}</section><div className="keyboard-hints"><span><kbd>F2</kbd> Buscar produto</span><span><kbd>Enter</kbd> Adicionar resultado único ou código</span><span><kbd>F8</kbd> Finalizar venda</span></div></div>
    <form className="checkout-summary" onSubmit={finish}><div className="summary-title"><ReceiptIcon/><h2>Resumo da venda</h2></div><fieldset disabled={busy}><label className="summary-label"><span><UserRound size={16}/> Cliente {method === "on_account" ? "*" : "(opcional)"}</span><select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required={method === "on_account"}><option value="">Consumidor não identificado</option>{data?.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><Link className="small-link" href="/clientes">Gerenciar clientes</Link><div className="summary-divider"/><label className="summary-label">Forma de pagamento</label><div className="payment-options" role="group" aria-label="Forma de pagamento">{paymentOptions.map(({ method: value, icon: Icon, label }) => <button type="button" key={value} aria-pressed={method === value} className={method === value ? "selected" : ""} onClick={() => { setMethod(value); setError(""); }}><Icon size={19}/><span>{label}</span>{method === value && <Check className="payment-check" size={12}/>}</button>)}</div>
    {method === "cash" && <div className="payment-detail"><label className="summary-label">Valor recebido (R$) *<input type="number" step="0.01" min={total} required value={received} onChange={(e) => setReceived(e.target.value)} placeholder="0,00"/></label><div className="summary-line"><span>Troco</span><strong>{money(Math.max(0, (Math.round(Number(received) * 100) - Math.round(total * 100)) / 100))}</strong></div></div>}
    {method === "on_account" && <div className="payment-detail"><p>Vincule um cliente e combine a data de pagamento.</p><label className="summary-label">Vencimento *<input type="date" min={localDate()} required value={dueDate} onInput={(e) => setDueDate(e.currentTarget.value)} onChange={(e) => setDueDate(e.target.value)}/></label></div>}
    <div className="summary-divider"/><div className="summary-line"><span>Quantidade de itens</span><strong>{count}</strong></div><div className="summary-line"><span>Subtotal</span><strong>{money(total)}</strong></div><div className="grand-total"><span>Total da venda</span><strong aria-live="polite">{money(total)}</strong><small>{paymentLabels[method]}{method === "on_account" ? " · pagamento pendente" : " · pagamento à vista"}</small></div><button ref={paymentRef} type="submit" className="book-button primary finish-button" disabled={!cart.length || busy}><CheckCircle2 size={19}/>{busy ? "Registrando…" : "Finalizar venda"}<kbd>F8</kbd></button><p className="checkout-note">{method === "on_account" ? "A compra ficará pendente no histórico de vendas." : "Confirme o recebimento antes de finalizar a venda."}</p></fieldset></form></div>
    {completed && <Modal title="Venda registrada!" description={`Venda #${completed.number} · ${completed.status === "pending" ? "Pagamento a prazo pendente" : "Pagamento confirmado"}`} onClose={() => setCompleted(null)}><SaleReceipt sale={completed}/><div className="dialog-actions"><Link href="/vendas" className="book-button">Ver vendas</Link><button className="book-button primary" onClick={() => { setCompleted(null); searchRef.current?.focus(); }}><Plus size={16}/> Nova venda</button></div></Modal>}
    {cancelOpen && <Modal title="Limpar esta venda?" description="Os itens e a forma de pagamento serão removidos do caixa." onClose={() => setCancelOpen(false)}><div className="dialog-actions"><button className="book-button" onClick={() => setCancelOpen(false)}>Continuar venda</button><button className="book-button destructive" onClick={() => { reset(); setCancelOpen(false); }}>Limpar venda</button></div></Modal>}
  </>;
}
function ReceiptIcon() { return <span className="summary-icon"><ShoppingBag size={20}/></span>; }

