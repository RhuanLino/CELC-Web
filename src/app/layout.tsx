import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "C.E.L.C | Casa Espiritualista Luz do Caminho",
  description: "Fé, conhecimento e caridade para o desenvolvimento espiritual e o bem-estar de todos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={`${inter.variable} ${lora.variable}`}><body>{children}</body></html>;
}
