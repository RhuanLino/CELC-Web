"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Banknote, CalendarDays, Check, CircleDollarSign, Clock3, Landmark, Plus, Search, X } from "lucide-react";
import styles from "./tesouraria.module.css";

type Status = "paid" | "pending";
type Method = "pix" | "cash" | "transfer" | "debit" | "credit";
type Obreiro = { id: string; name: string; monthlyFee: number };
type Mensalidade = { id: string; obreiroId: string; obreiroName: string; amount: number; month: number; year: number; dueDate: string; status: Status; method?: Method; paidAt?: string; notes: string };

const STORAGE_KEY = "celc-tesouraria-mensalidades-v1";
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const METHODS: { value: Method; label: string }[] = [{ value: "pix", label: "Pix" }, { value: "cash", label: "Dinheiro" }, { value: "transfer", label: "Transferência" }, { value: "debit", label: "Cartão de débito" }, { value: "credit", label: "Cartão de crédito" }];
const formatMoney = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const today = () => new Date().toISOString().slice(0, 10);
const monthKey = (date = new Date()) => ({ month: date.getMonth() + 1, year: date.getFullYear() });
const defaultObreiros: Obreiro[] = [{ id: "o1", name: "Ana Beatriz", monthlyFee: 80 }, { id: "o2", name: "Carlos Eduardo", monthlyFee: 60 }, { id: "o3", name: "Maria de Fátima", monthlyFee: 100 }, { id: "o4", name: "João Paulo", monthlyFee: 75 }];
const seedPayments = (): Mensalidade[] => {
  const { month, year } = monthKey();
  const date = `${year}-${String(month).padStart(2, "0")}`;
  return [
    { id: "m1", obreiroId: "o1", obreiroName: "Ana Beatriz", amount: 80, month, year, dueDate: `${date}-10`, status: "paid", method: "pix", paidAt: `${date}-08`, notes: "" },
    { id: "m2", obreiroId: "o2", obreiroName: "Carlos Eduardo", amount: 60, month, year, dueDate: `${date}-10`, status: "pending", notes: "" },
    { id: "m3", obreiroId: "o3", obreiroName: "Maria de Fátima", amount: 100, month, year, dueDate: `${date}-10`, status: "pending", notes: "" },
  ];
};
const readPayments = (): Mensalidade[] => {
  if (typeof window === "undefined") return seedPayments();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as Mensalidade[] : seedPayments();
  } catch { return seedPayments(); }
};

export default function TesourariaPage() {
  const current = monthKey();
  const [obreiros] = useState(defaultObreiros);
  const [payments, setPayments] = useState<Mensalidade[]>(readPayments);
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState(String(current.month));
  const [year, setYear] = useState(String(current.year));
  const [status, setStatus] = useState<"" | Status>("");
  const [launching, setLaunching] = useState(false);
  const [receiving, setReceiving] = useState<Mensalidade | null>(null);

  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payments)); }, [payments]);

  const years = useMemo(() => [...new Set([...payments.map((item) => item.year), current.year])].sort((a, b) => b - a), [payments, current.year]);
  const rows = payments.filter((item) => item.obreiroName.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")) && (!month || item.month === Number(month)) && (!year || item.year === Number(year)) && (!status || item.status === status)).sort((a, b) => b.year - a.year || b.month - a.month || a.obreiroName.localeCompare(b.obreiroName));
  const received = rows.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
  const pending = rows.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.amount, 0);

  function addPayment(payment: Mensalidade) { setPayments((items) => [payment, ...items]); setLaunching(false); }
  function receive(id: string, method: Method, paidAt: string, notes: string) { setPayments((items) => items.map((item) => item.id === id ? { ...item, status: "paid", method, paidAt, notes } : item)); setReceiving(null); }

  return <main className={styles.page}><section className={styles.shell}>
    <header className={styles.header}><div><p className={styles.eyebrow}>C.E.L.C. · GESTÃO FINANCEIRA</p><h1>Tesouraria</h1><p className={styles.subtitle}>Acompanhe as mensalidades dos obreiros com clareza e segurança.</p></div><div style={{ display: "flex", alignItems: "center", gap: 10 }}><a className={styles.secondaryButton} href="/api/auth/logout" style={{ textDecoration: "none" }}>Sair</a><button className={styles.primaryButton} onClick={() => setLaunching(true)}><Plus size={18}/> Lançar mensalidade</button></div></header>
    <section className={styles.metrics} aria-label="Resumo das mensalidades"><Metric icon={<Banknote size={20}/>} label="Recebido" value={formatMoney(received)} note={`${rows.filter((item) => item.status === "paid").length} mensalidades baixadas`}/><Metric icon={<Clock3 size={20}/>} label="Em aberto" value={formatMoney(pending)} note={`${rows.filter((item) => item.status === "pending").length} mensalidades pendentes`} accent/><Metric icon={<CircleDollarSign size={20}/>} label="Previsto" value={formatMoney(received + pending)} note="Total conforme os filtros"/></section>
    <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Mensalidades</h2><p>O valor de cada lançamento é copiado do cadastro do obreiro.</p></div><span className={styles.counter}>{rows.length} registros</span></div><div className={styles.filters}><label className={styles.search}><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar obreiro" aria-label="Buscar obreiro"/></label><select value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Filtrar por mês"><option value="">Todos os meses</option>{MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select><select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filtrar por ano"><option value="">Todos os anos</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value as "" | Status)} aria-label="Filtrar por situação"><option value="">Todas as situações</option><option value="paid">Pagas</option><option value="pending">Pendentes</option></select></div>
      {rows.length === 0 ? <div className={styles.empty}><CalendarDays size={28}/><strong>Nenhuma mensalidade encontrada</strong><span>Altere os filtros ou faça um novo lançamento.</span></div> : <div className={styles.tableWrap}><table><thead><tr><th>Obreiro</th><th>Referência</th><th>Vencimento</th><th>Valor</th><th>Recebimento</th><th>Situação</th><th aria-label="Ação"/></tr></thead><tbody>{rows.map((item) => <Row key={item.id} item={item} onReceive={() => setReceiving(item)}/>)}</tbody></table></div>}
    </section><footer className={styles.footer}><span><Landmark size={15}/> Casa Espiritualista Luz do Caminho</span><span>Dados salvos neste navegador</span></footer>
  </section>{launching && <LaunchModal obreiros={obreiros} payments={payments} onClose={() => setLaunching(false)} onSave={addPayment}/>} {receiving && <ReceiveModal payment={receiving} onClose={() => setReceiving(null)} onSave={receive}/>}</main>;
}

function Metric({ icon, label, value, note, accent = false }: { icon: React.ReactNode; label: string; value: string; note: string; accent?: boolean }) { return <article className={`${styles.metric} ${accent ? styles.accentMetric : ""}`}><span className={styles.metricIcon}>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>; }
function Row({ item, onReceive }: { item: Mensalidade; onReceive: () => void }) { const overdue = item.status === "pending" && item.dueDate < today(); return <tr><td><div className={styles.person}><span>{item.obreiroName.split(" ").slice(0, 2).map((word) => word[0]).join("")}</span><strong>{item.obreiroName}</strong></div></td><td>{MONTHS[item.month - 1]}<small>{item.year}</small></td><td>{item.dueDate.split("-").reverse().join("/")}</td><td><strong>{formatMoney(item.amount)}</strong></td><td>{item.status === "paid" ? <><span>{METHODS.find((method) => method.value === item.method)?.label}</span><small>{item.paidAt?.split("-").reverse().join("/")}</small></> : "—"}</td><td><span className={`${styles.status} ${item.status === "paid" ? styles.paid : styles.pending}`}>{item.status === "paid" ? "Paga" : overdue ? "Pendente · vencida" : "Pendente"}</span></td><td>{item.status === "pending" && <button className={styles.receiveButton} onClick={onReceive}><Check size={15}/> Receber</button>}</td></tr>; }

function LaunchModal({ obreiros, payments, onClose, onSave }: { obreiros: Obreiro[]; payments: Mensalidade[]; onClose: () => void; onSave: (payment: Mensalidade) => void }) { const current = monthKey(); const [obreiroId, setObreiroId] = useState(""); const [status, setStatus] = useState<Status>("pending"); const [error, setError] = useState(""); const obreiro = obreiros.find((item) => item.id === obreiroId); function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const selectedMonth = Number(form.get("month")); const selectedYear = Number(form.get("year")); if (!obreiro) return setError("Selecione um obreiro."); if (payments.some((item) => item.obreiroId === obreiro.id && item.month === selectedMonth && item.year === selectedYear)) return setError("Já existe uma mensalidade lançada para este obreiro neste período."); onSave({ id: crypto.randomUUID(), obreiroId: obreiro.id, obreiroName: obreiro.name, amount: obreiro.monthlyFee, month: selectedMonth, year: selectedYear, dueDate: String(form.get("dueDate")), status, ...(status === "paid" ? { method: String(form.get("method")) as Method, paidAt: String(form.get("paidAt")) } : {}), notes: String(form.get("notes") ?? "") }); } return <Modal title="Lançar mensalidade" description="O valor é obtido do cadastro do obreiro." onClose={onClose}><form onSubmit={submit}><label>Obreiro *<select value={obreiroId} onChange={(event) => setObreiroId(event.target.value)}><option value="">Selecione</option>{obreiros.map((item) => <option key={item.id} value={item.id}>{item.name} · {formatMoney(item.monthlyFee)}</option>)}</select></label>{obreiro && <div className={styles.valuePreview}><span>Valor desta mensalidade</span><strong>{formatMoney(obreiro.monthlyFee)}</strong></div>}<div className={styles.formGrid}><label>Mês *<select name="month" defaultValue={current.month}>{MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select></label><label>Ano *<input name="year" type="number" min="2000" max="2100" defaultValue={current.year}/></label><label>Vencimento *<input name="dueDate" type="date" defaultValue={`${current.year}-${String(current.month).padStart(2, "0")}-10`}/></label><label>Situação *<select value={status} onChange={(event) => setStatus(event.target.value as Status)}><option value="pending">Pendente</option><option value="paid">Paga</option></select></label></div>{status === "paid" && <div className={styles.formGrid}><label>Forma de pagamento *<select name="method" defaultValue="pix">{METHODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Data do pagamento *<input name="paidAt" type="date" defaultValue={today()}/></label></div>}<label>Observações<textarea name="notes" rows={2} placeholder="Opcional"/></label>{error && <p className={styles.error}>{error}</p>}<div className={styles.actions}><button type="button" className={styles.secondaryButton} onClick={onClose}>Cancelar</button><button className={styles.primaryButton}>{status === "paid" ? "Lançar como paga" : "Lançar pendente"}</button></div></form></Modal>; }
function ReceiveModal({ payment, onClose, onSave }: { payment: Mensalidade; onClose: () => void; onSave: (id: string, method: Method, paidAt: string, notes: string) => void }) { function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); onSave(payment.id, String(form.get("method")) as Method, String(form.get("paidAt")), String(form.get("notes") ?? "")); } return <Modal title="Receber mensalidade" description={`${payment.obreiroName} · ${MONTHS[payment.month - 1]} de ${payment.year} · ${formatMoney(payment.amount)}`} onClose={onClose}><form onSubmit={submit}><div className={styles.formGrid}><label>Forma de pagamento *<select name="method" defaultValue="pix">{METHODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Data do pagamento *<input name="paidAt" type="date" defaultValue={today()}/></label></div><label>Observações<textarea name="notes" rows={2} defaultValue={payment.notes} placeholder="Opcional"/></label><div className={styles.actions}><button type="button" className={styles.secondaryButton} onClick={onClose}>Cancelar</button><button className={styles.primaryButton}><Check size={16}/> Confirmar recebimento</button></div></form></Modal>; }
function Modal({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: React.ReactNode }) { return <div className={styles.backdrop} role="presentation" onMouseDown={onClose}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}><header><div><h2 id="modal-title">{title}</h2><p>{description}</p></div><button className={styles.close} onClick={onClose} aria-label="Fechar"><X size={19}/></button></header>{children}</section></div>; }
