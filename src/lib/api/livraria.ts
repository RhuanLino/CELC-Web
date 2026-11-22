import type {
  BookstoreService,
  Customer,
  CustomerInput,
  Product,
  ProductInput,
  Sale,
  SaleInput,
} from "@/modules/livraria/types";
import { api } from "./client";

function resource<T, Input>(path: string) {
  return {
    list: (query = "") => api.get<T[]>(path, query ? { params: { q: query } } : undefined),
    getById: (id: string) => api.get<T>(`${path}/${encodeURIComponent(id)}`),
    create: (input: Input) => api.post<T>(path, input),
    update: (id: string, input: Input) => api.put<T>(`${path}/${encodeURIComponent(id)}`, input),
    remove: (id: string) => api.delete(`${path}/${encodeURIComponent(id)}`),
  };
}

export const livrariaApi: BookstoreService = {
  products: resource<Product, ProductInput>("/api/products"),
  customers: resource<Customer, CustomerInput>("/api/customers"),
  sales: {
    list: () => api.get<Sale[]>("/api/sales"),
    getById: (id: string) => api.get<Sale>(`/api/sales/${encodeURIComponent(id)}`),
    create: (input: SaleInput) => api.post<Sale>("/api/sales", input),
  },
};
