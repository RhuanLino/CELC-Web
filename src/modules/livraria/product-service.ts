import type { Product, ProductInput, ProductLookups } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message)
        : "Não foi possível concluir. Tente novamente.";
    throw new Error(message);
  }

  return payload as T;
}

export const productService = {
  list: () => request<Product[]>("/api/produtos"),
  create: (input: ProductInput) =>
    request<Product>("/api/produtos", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: ProductInput) =>
    request<Product>(`/api/produtos/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: string) => request<void>(`/api/produtos/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const loadProductLookups = () => request<ProductLookups>("/api/lookups");
