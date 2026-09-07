import productSeed from "./data/products.json";
import customerSeed from "./data/customers.json";
import saleSeed from "./data/sales.json";
import type { BookstoreService, Customer, CustomerInput, Product, ProductInput, Sale } from "./types";

export class BookstoreError extends Error {}
const clone = <T,>(value: T): T => structuredClone(value);
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const cents = (value: number) => Math.round(value * 100);
const requireValue = (condition: unknown, message: string) => { if (!condition) throw new BookstoreError(message); };

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** In-memory adapter. Replace this factory with an HTTP adapter implementing BookstoreService. */
export function createMockBookstoreService(): BookstoreService {
  let products: Product[] = clone(productSeed);
  let customers: Customer[] = clone(customerSeed);
  const sales: Sale[] = clone(saleSeed);
  const find = <T extends { id: string }>(rows: T[], id: string): T => {
    const row = rows.find((item) => item.id === id);
    if (!row) throw new BookstoreError("Registro não encontrado. Atualize a página e tente novamente.");
    return row;
  };
  const productData = (input: ProductInput, id?: string): ProductInput => {
    requireValue(input.name.trim() && input.category.trim() && input.sku.trim(), "Preencha nome, categoria e código do produto.");
    requireValue(Number.isFinite(input.price) && input.price >= 0.01 && input.price <= 999999, "Informe um preço entre R$ 0,01 e R$ 999.999,00.");
    requireValue(Number.isSafeInteger(input.stock) && input.stock >= 0, "O estoque deve ser um número inteiro maior ou igual a zero.");
    requireValue(!products.some((p) => p.id !== id && normalize(p.sku) === normalize(input.sku.trim())), "Já existe um produto com esse código.");
    return { ...input, name: input.name.trim(), category: input.category.trim(), author: input.author.trim(), sku: input.sku.trim().toUpperCase(), price: cents(input.price) / 100 };
  };
  const customerData = (input: CustomerInput): CustomerInput => {
    requireValue(input.name.trim().length >= 2, "Informe o nome do cliente (pelo menos 2 caracteres).");
    requireValue(!input.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()), "Informe um e-mail válido.");
    requireValue(!input.phone || [10, 11].includes(input.phone.replace(/\D/g, "").length), "Informe um telefone com DDD (10 ou 11 dígitos).");
    return { name: input.name.trim(), email: input.email.trim(), phone: input.phone.trim(), notes: input.notes.trim() };
  };
  return {
    products: {
      async list(query = "") { return clone(products.filter((p) => normalize(`${p.name} ${p.author} ${p.sku}`).includes(normalize(query)))); },
      async getById(id) { return clone(find(products, id)); },
      async create(input) { const row = { ...productData(input), id: crypto.randomUUID() }; products.push(row); return clone(row); },
      async update(id, input) { const row = find(products, id); Object.assign(row, productData(input, id)); return clone(row); },
      async remove(id) { find(products, id); products = products.filter((p) => p.id !== id); },
    },
    customers: {
      async list(query = "") { return clone(customers.filter((c) => normalize(`${c.name} ${c.email} ${c.phone}`).includes(normalize(query)))); },
      async getById(id) { return clone(find(customers, id)); },
      async create(input) { const row = { ...customerData(input), id: crypto.randomUUID() }; customers.push(row); return clone(row); },
      async update(id, input) { const row = find(customers, id); Object.assign(row, customerData(input)); return clone(row); },
      async remove(id) {
        find(customers, id);
        requireValue(!sales.some((s) => s.customerId === id && s.status === "pending"), "Este cliente possui uma compra a prazo pendente e não pode ser excluído.");
        customers = customers.filter((c) => c.id !== id);
      },
    },
    sales: {
      async list() { return clone([...sales].reverse()); },
      async getById(id) { return clone(find(sales, id)); },
      async create(input) {
        requireValue(input.items.length > 0, "Adicione pelo menos um produto à venda.");
        requireValue(["pix", "credit", "debit", "cash", "on_account"].includes(input.payment.method), "Selecione uma forma de pagamento válida.");
        const customer = input.customerId ? find(customers, input.customerId) : null;
        const quantities = new Map<string, number>();
        for (const item of input.items) {
          requireValue(Number.isSafeInteger(item.quantity) && item.quantity > 0, "A quantidade deve ser um número inteiro positivo.");
          quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
        }
        const items = [...quantities].map(([productId, quantity]) => {
          const product = find(products, productId);
          requireValue(quantity <= product.stock, `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}.`);
          return { productId, name: product.name, sku: product.sku, quantity, unitPrice: product.price, total: cents(product.price) * quantity / 100 };
        });
        const total = items.reduce((sum, item) => sum + cents(item.total), 0) / 100;
        let change = 0;
        const payment: Sale["payment"] = { method: input.payment.method };
        if (payment.method === "cash") {
          const received = input.payment.amountTendered;
          requireValue(received !== undefined && Number.isFinite(received) && cents(received) >= cents(total), "O valor recebido deve ser igual ou maior que o total.");
          payment.amountTendered = cents(received!) / 100;
          change = (cents(received!) - cents(total)) / 100;
        }
        if (payment.method === "on_account") {
          requireValue(customer, "Selecione um cliente para vender a prazo.");
          const due = input.payment.dueDate ?? "";
          const parsed = new Date(`${due}T12:00:00`);
          requireValue(/^\d{4}-\d{2}-\d{2}$/.test(due) && !Number.isNaN(parsed.getTime()) && localDate(parsed) === due && due >= localDate(), "Informe um vencimento válido a partir de hoje.");
          payment.dueDate = due;
        }
        const sale: Sale = { id: crypto.randomUUID(), number: String(sales.length + 1).padStart(4, "0"), createdAt: new Date().toISOString(), customerId: customer?.id ?? null, customerName: customer?.name ?? "Consumidor não identificado", items, total, payment, change, status: payment.method === "on_account" ? "pending" : "paid" };
        // Validate everything before changing stock or recording the sale.
        for (const item of items) find(products, item.productId).stock -= item.quantity;
        sales.push(sale);
        return clone(sale);
      },
    },
  };
}

export const bookstoreService: BookstoreService = createMockBookstoreService();
