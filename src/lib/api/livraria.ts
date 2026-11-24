import type {
  BookstoreService,
  Customer,
  CustomerInput,
  LookupOption,
  Product,
  ProductInput,
  ProductLookups,
  Sale,
  SaleInput,
} from "@/modules/livraria/types";
import { api } from "./client";

interface RawProduct {
  id: number;
  codigoBarras: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  validade: string | null;
  isbn: number | null;
  categoriaId: number | null;
  categoriaNome: string | null;
  marcaId: number | null;
  marcaNome: string | null;
  generoId: number | null;
  generoNome: string | null;
  espiritoId: number | null;
  espiritoNome: string | null;
  autorId: number | null;
  autorNome: string | null;
}

interface RawLookup {
  id: number;
  nome: string;
}

function resource<T, Input>(path: string) {
  return {
    list: (query = "") => api.get<T[]>(path, query ? { params: { q: query } } : undefined),
    getById: (id: string) => api.get<T>(`${path}/${encodeURIComponent(id)}`),
    create: (input: Input) => api.post<T>(path, input),
    update: (id: string, input: Input) => api.put<T>(`${path}/${encodeURIComponent(id)}`, input),
    remove: (id: string) => api.delete(`${path}/${encodeURIComponent(id)}`),
  };
}

const nullable = (value: string) => (value.trim() ? value.trim() : null);
const optionalId = (value: string) => (value.trim() ? Number(value) : null);

function toProduct(raw: RawProduct): Product {
  return {
    id: String(raw.id),
    codigoBarras: String(raw.codigoBarras),
    nome: raw.nome,
    descricao: raw.descricao ?? "",
    preco: raw.preco,
    estoque: raw.estoque,
    validade: raw.validade ?? "",
    isbn: raw.isbn == null ? "" : String(raw.isbn),
    categoriaId: raw.categoriaId == null ? "" : String(raw.categoriaId),
    categoriaNome: raw.categoriaNome ?? "",
    marcaId: raw.marcaId == null ? "" : String(raw.marcaId),
    marcaNome: raw.marcaNome ?? "",
    generoId: raw.generoId == null ? "" : String(raw.generoId),
    generoNome: raw.generoNome ?? "",
    espiritoId: raw.espiritoId == null ? "" : String(raw.espiritoId),
    espiritoNome: raw.espiritoNome ?? "",
    autorId: raw.autorId == null ? "" : String(raw.autorId),
    autorNome: raw.autorNome ?? "",
  };
}

function toPayload(input: ProductInput) {
  return {
    codigoBarras: Number(input.codigoBarras),
    nome: input.nome.trim(),
    descricao: nullable(input.descricao),
    preco: input.preco,
    estoque: input.estoque,
    validade: nullable(input.validade),
    isbn: input.isbn.trim() ? Number(input.isbn) : null,
    categoriaId: Number(input.categoriaId),
    marcaId: Number(input.marcaId),
    generoId: optionalId(input.generoId),
    espiritoId: optionalId(input.espiritoId),
    autorId: optionalId(input.autorId),
  };
}

export const productCatalogApi = {
  list: async () => (await api.get<RawProduct[]>("/produtos")).map(toProduct),
  getById: async (id: string) => toProduct(await api.get<RawProduct>(`/produtos/${encodeURIComponent(id)}`)),
  create: async (input: ProductInput) => toProduct(await api.post<RawProduct>("/produtos", toPayload(input))),
  update: async (id: string, input: ProductInput) =>
    toProduct(await api.put<RawProduct>(`/produtos/${encodeURIComponent(id)}`, toPayload(input))),
  remove: (id: string) => api.delete(`/produtos/${encodeURIComponent(id)}`),
};

async function lookup(path: string): Promise<LookupOption[]> {
  const rows = await api.get<RawLookup[]>(path);
  return rows.map((row) => ({ id: String(row.id), nome: row.nome }));
}

export async function loadProductLookups(): Promise<ProductLookups> {
  const [categorias, marcas, generos, espiritos, autores] = await Promise.all([
    lookup("/categorias"),
    lookup("/marcas"),
    lookup("/generos"),
    lookup("/espiritos"),
    lookup("/autores"),
  ]);
  return { categorias, marcas, generos, espiritos, autores };
}

export const livrariaApi: BookstoreService = {
  products: productCatalogApi,
  customers: resource<Customer, CustomerInput>("/api/customers"),
  sales: {
    list: () => api.get<Sale[]>("/api/sales"),
    getById: (id: string) => api.get<Sale>(`/api/sales/${encodeURIComponent(id)}`),
    create: (input: SaleInput) => api.post<Sale>("/api/sales", input),
  },
};
