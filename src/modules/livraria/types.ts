export interface Product {
  id: string;
  name: string;
  author: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
}

export type ProductInput = Omit<Product, "id">;

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export type CustomerInput = Omit<Customer, "id">;
export type PaymentMethod = "pix" | "credit" | "debit" | "cash" | "on_account";

export interface SaleInput {
  customerId: string | null;
  items: { productId: string; quantity: number }[];
  payment: { method: PaymentMethod; amountTendered?: number; dueDate?: string };
}

export interface SaleItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  number: string;
  createdAt: string;
  customerId: string | null;
  customerName: string;
  items: SaleItem[];
  total: number;
  payment: SaleInput["payment"];
  change: number;
  status: "paid" | "pending";
}

export interface CrudService<T, Input> {
  list(query?: string): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(input: Input): Promise<T>;
  update(id: string, input: Input): Promise<T>;
  remove(id: string): Promise<void>;
}

export interface BookstoreService {
  products: CrudService<Product, ProductInput>;
  customers: CrudService<Customer, CustomerInput>;
  sales: {
    list(): Promise<Sale[]>;
    getById(id: string): Promise<Sale>;
    create(input: SaleInput): Promise<Sale>;
  };
}
