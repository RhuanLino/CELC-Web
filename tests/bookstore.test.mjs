import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

// Compile the adapter in isolation with the project's existing TypeScript dependency.
const path = fileURLToPath(new URL("../src/modules/livraria/service.ts", import.meta.url));
const compiled = ts.transpileModule(readFileSync(path, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const adapter = {};
new Function("require", "exports", compiled)(createRequire(path), adapter);
const { createMockBookstoreService, localDate } = adapter;
const product = { name: "Livro de teste", author: "Autor", category: "Estudo", sku: "TEST-01", price: 0.1, stock: 5 };
const customer = { name: "Leitor Teste", email: "leitor@example.com", phone: "61999999999", notes: "" };
const sale = (items, payment = { method: "pix" }, customerId = null) => ({ items, payment, customerId });

test("CRUD de produtos, código único, busca e isolamento dos dados", async () => {
  const service = createMockBookstoreService();
  const created = await service.products.create(product);
  await assert.rejects(service.products.create({ ...product, sku: "test-01" }), /código/);
  await assert.rejects(service.products.create({ ...product, sku: "INVALID", price: 0.001 }), /preço/);
  await service.products.update(created.id, { ...product, name: "Livro atualizado", price: 20 });
  assert.equal((await service.products.getById(created.id)).price, 20);
  const rows = await service.products.list("atualizado");
  assert.equal(rows.length, 1);
  rows[0].stock = 999;
  assert.equal((await service.products.getById(created.id)).stock, 5);
  await service.products.remove(created.id);
  await assert.rejects(service.products.getById(created.id), /não encontrado/);
});

test("CRUD de clientes e validação dos contatos", async () => {
  const service = createMockBookstoreService();
  await assert.rejects(service.customers.create({ ...customer, email: "invalido" }), /e-mail/);
  const created = await service.customers.create(customer);
  await service.customers.update(created.id, { ...customer, name: "Leitor Atualizado" });
  assert.equal((await service.customers.list("Atualizado")).length, 1);
  await service.customers.remove(created.id);
  await assert.rejects(service.customers.getById(created.id), /não encontrado/);
});

test("dinheiro: soma em centavos, troco e baixa de estoque", async () => {
  const service = createMockBookstoreService();
  const p = await service.products.create(product);
  const result = await service.sales.create(sale([{ productId: p.id, quantity: 3 }], { method: "cash", amountTendered: 1 }));
  assert.equal(result.total, 0.3);
  assert.equal(result.change, 0.7);
  assert.equal(result.status, "paid");
  assert.equal((await service.products.getById(p.id)).stock, 2);
});

test("falhas não alteram estoque nem registram vendas parcialmente", async () => {
  const service = createMockBookstoreService();
  await assert.rejects(service.sales.create(sale([{ productId: "p1", quantity: 1 }, { productId: "p4", quantity: 4 }])), /Estoque insuficiente/);
  await assert.rejects(service.sales.create(sale([{ productId: "p1", quantity: 1 }], { method: "cash", amountTendered: 1 })), /valor recebido/);
  await assert.rejects(service.sales.create(sale([])), /pelo menos/);
  await assert.rejects(service.sales.create(sale([{ productId: "p1", quantity: 1.5 }])), /inteiro/);
  assert.equal((await service.products.getById("p1")).stock, 18);
  assert.equal((await service.sales.list()).length, 0);
});

test("itens repetidos são somados antes de validar estoque", async () => {
  const service = createMockBookstoreService();
  await assert.rejects(service.sales.create(sale([{ productId: "p4", quantity: 2 }, { productId: "p4", quantity: 2 }])), /Estoque insuficiente/);
  const result = await service.sales.create(sale([{ productId: "p4", quantity: 1 }, { productId: "p4", quantity: 2 }]));
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].quantity, 3);
});

test("a prazo exige cliente e data real; bloqueia exclusão de devedor", async () => {
  const service = createMockBookstoreService();
  const items = [{ productId: "p1", quantity: 1 }];
  await assert.rejects(service.sales.create(sale(items, { method: "on_account", dueDate: localDate() })), /cliente/);
  for (const dueDate of ["", "2020-01-01", "2099-02-31"]) {
    await assert.rejects(service.sales.create(sale(items, { method: "on_account", dueDate }, "c1")), /vencimento/);
  }
  const result = await service.sales.create(sale(items, { method: "on_account", dueDate: localDate() }, "c1"));
  assert.equal(result.status, "pending");
  assert.equal(result.customerName, "Ana Oliveira");
  await assert.rejects(service.customers.remove("c1"), /pendente/);
});

test("Pix e cartões; histórico preserva preço e nome após edição/exclusão", async () => {
  const service = createMockBookstoreService();
  for (const method of ["pix", "credit", "debit"]) {
    const result = await service.sales.create(sale([{ productId: "p1", quantity: 1 }], { method }));
    assert.equal(result.status, "paid");
  }
  const p = await service.products.getById("p1");
  await service.products.update("p1", { ...p, name: "Nome alterado", price: 999 });
  await service.products.remove("p1");
  const history = await service.sales.list();
  assert.equal(history[0].items[0].name, "O Livro dos Espíritos");
  assert.equal(history[0].items[0].unitPrice, 42.9);
  assert.equal((await service.sales.getById(history[0].id)).number, "0003");
});
