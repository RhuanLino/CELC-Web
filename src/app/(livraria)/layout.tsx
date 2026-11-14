import { BookstoreShell } from "@/modules/livraria/components/shared";

export default function LivrariaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BookstoreShell>{children}</BookstoreShell>;
}
