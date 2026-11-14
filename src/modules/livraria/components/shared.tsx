"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, LayoutDashboard, Package, ReceiptText, ShoppingBag, Users, X } from "lucide-react";
import { errorMessage } from "../format";

const navigation = [
  { href: "/livraria", label: "Visão geral", icon: LayoutDashboard },
  { href: "/caixa", label: "Frente de caixa", icon: ShoppingBag },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/vendas", label: "Vendas", icon: ReceiptText },
];
export function BookstoreShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return <div className="bookstore"><aside className="book-sidebar">
    <Link href="/livraria" className="book-brand"><span className="brand-symbol"><BookOpen size={25} strokeWidth={1.5}/></span><span>Humberto<br/><strong>de Campos</strong><small>LIVRARIA · C.E.L.C</small></span></Link>
    <p className="nav-caption">GESTÃO DA LIVRARIA</p>
    <nav aria-label="Livraria">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} className={path === href ? "active" : ""}><Icon size={19}/>{label}{href === "/caixa" && <span className="nav-pdv">PDV</span>}</Link>)}</nav>
    <div className="sidebar-bottom"><div className="sidebar-note"><BookOpen size={22}/><p>Conhecimento que<br/><em>ilumina caminhos.</em></p><span>Desde 1977, a serviço do bem.</span></div><Link href="/"><ArrowLeft size={16}/> Voltar para a C.E.L.C <ArrowUpRight size={14}/></Link></div>
  </aside><div className="book-workspace"><header className="book-topbar"><div><span className="topbar-parent">Livraria</span><span className="breadcrumb-slash">/</span><strong>{navigation.find((n) => n.href === path)?.label ?? "Gestão"}</strong></div><span className="demo-badge"><span/> Demonstração</span></header><main className="book-main">{children}</main><footer className="book-footer"><span>Livraria Humberto de Campos</span><span>Casa Espiritualista Luz do Caminho</span></footer></div></div>;
}
export function PageHeading({ eyebrow = "LIVRARIA HUMBERTO DE CAMPOS", title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><p className="book-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
export function Modal({ title, description, children, onClose }: { title: string; description?: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; const previous = document.activeElement as HTMLElement | null; dialog?.showModal(); return () => { dialog?.close(); previous?.focus(); }; }, []);
  return <dialog ref={ref} className="book-dialog" onCancel={(e) => { e.preventDefault(); onClose(); }}><div className="dialog-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button type="button" className="icon-button" onClick={onClose} aria-label="Fechar janela"><X size={20}/></button></div>{children}</dialog>;
}
export function Notice({ children, success = false }: { children: ReactNode; success?: boolean }) { return <div className={`book-notice ${success ? "success" : ""}`} role={success ? "status" : "alert"}>{children}</div>; }
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="empty-state"><BookOpen size={32} strokeWidth={1.3}/><h3>{title}</h3><p>{description}</p></div>; }
export function useBookstoreData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; loader().then((value) => { if (active) setData(value); }).catch((err) => { if (active) setError(errorMessage(err)); }); return () => { active = false; }; }, [loader]);
  async function reload() { try { setData(await loader()); setError(""); } catch (err) { setError(errorMessage(err)); } }
  return { data, error, reload };
}
export function Metric({ label, value, note, icon, warm = false }: { label: string; value: string; note: string; icon?: ReactNode; warm?: boolean }) { return <article className={`metric ${warm ? "warm" : ""}`}><div><span>{label}</span>{icon}</div><strong>{value}</strong><small>{note}</small></article>; }
