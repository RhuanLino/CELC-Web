import type { PaymentMethod } from "./types";

export const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
export const dateTime = (value: string) => new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
export const paymentLabels: Record<PaymentMethod, string> = { pix: "Pix", credit: "Cartão de crédito", debit: "Cartão de débito", cash: "Dinheiro", on_account: "A prazo" };
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Não foi possível concluir. Tente novamente.";
