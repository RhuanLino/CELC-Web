"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, ShoppingCart, Receipt } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/obreiros", label: "Obreiros", icon: Users },
  { href: "/caixa", label: "Caixa", icon: ShoppingCart },
  { href: "/debitos", label: "Débitos", icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen border-r bg-white flex flex-col p-4">
      <h1 className="text-lg font-bold mb-6">Livraria Humberto de Campos</h1>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
              pathname === href ? "bg-gray-900 text-white" : "hover:bg-gray-100"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}