# Livraria Humberto de Campos

## Telas e comportamento

| Rota | Interface |
| --- | --- |
| `/livraria` | Visão geral: vendas e recebimentos do dia, valor a receber, últimas vendas e atalhos. |
| `/produtos` | Indicadores do acervo, busca por título/autor/código, filtro de categoria, listagem e formulários de criação/edição, confirmação de exclusão. |
| `/clientes` | Busca por nome/telefone/e-mail, contatos e observações, criação, edição e exclusão. |
| `/caixa` | PDV: busca rápida, produtos, carrinho, quantidade, preço unitário, subtotal, total e pagamento. |
| `/vendas` | Histórico com busca, filtro de situação e detalhes de cada venda. |

Identidade visual: azul profundo da C.E.L.C na navegação, verde nos comandos de confirmação, dourado suave nos avisos e fundos claros. Títulos em Lora e textos em Inter, aproveitando as fontes existentes. Em telas pequenas a navegação passa para o topo, o caixa fica em uma coluna e as tabelas permitem rolagem horizontal. Formulários usam diálogos nativos com foco contido e fechamento por Escape.

No caixa: **F2** foca a busca; **Enter** adiciona um resultado único ou um código exato; **F8** finaliza usando as validações do formulário. Os botões +/− e o campo numérico alteram quantidades. Um leitor que emule teclado pode digitar o código cadastrado e enviar Enter; não há integração dedicada com hardware. A limpeza do carrinho pede confirmação.

## Dados e serviços

- Contratos: `src/modules/livraria/types.ts`.
- Adaptador simulado e ponto de substituição: `src/modules/livraria/service.ts`, exportação `bookstoreService: BookstoreService`.
- JSONs iniciais: `src/modules/livraria/data/` — 7 produtos, 3 clientes fictícios e nenhuma venda.
- Componentes consomem apenas os métodos assíncronos do serviço, sem chamadas a endpoints inexistentes.
- O adaptador mantém alterações **em memória na aba**, compartilhadas entre as rotas via navegação interna. Recarregar a página ou abrir outra aba restaura os JSONs. Não há banco, localStorage ou persistência no servidor; os arquivos JSON não são modificados pelas telas.
- Cada consulta retorna cópias, evitando alterações acidentais por referência. `createMockBookstoreService()` cria uma instância isolada para testes.

## Contrato proposto para a API

Os endpoints abaixo estão documentados para implementação futura; ainda não existem no projeto.

| Método do serviço | Endpoint proposto | Entrada | Saída |
| --- | --- | --- | --- |
| `products.list(query?)` | `GET /api/products?q=` | Busca opcional | `Product[]` |
| `products.getById(id)` | `GET /api/products/:id` | ID | `Product` |
| `products.create(input)` | `POST /api/products` | `ProductInput` | `Product` |
| `products.update(id, input)` | `PUT /api/products/:id` | `ProductInput` completo | `Product` |
| `products.remove(id)` | `DELETE /api/products/:id` | ID | Sem corpo |
| `customers.list(query?)` | `GET /api/customers?q=` | Busca opcional | `Customer[]` |
| `customers.getById(id)` | `GET /api/customers/:id` | ID | `Customer` |
| `customers.create(input)` | `POST /api/customers` | `CustomerInput` | `Customer` |
| `customers.update(id, input)` | `PUT /api/customers/:id` | `CustomerInput` completo | `Customer` |
| `customers.remove(id)` | `DELETE /api/customers/:id` | ID | Sem corpo |
| `sales.list()` | `GET /api/sales` | — | `Sale[]`, mais recentes primeiro |
| `sales.getById(id)` | `GET /api/sales/:id` | ID | `Sale` |
| `sales.create(input)` | `POST /api/sales` | `SaleInput` | `Sale` com valores calculados |

`ProductInput`: `name`, `author`, `category`, `sku`, `price` (reais), `stock` (inteiro). Código único sem diferenciar maiúsculas/minúsculas; nome, categoria, código, preço positivo e estoque não negativo são obrigatórios.

`CustomerInput`: `name`, `email`, `phone`, `notes`. Nome obrigatório; os demais campos aceitam string vazia. Quando preenchidos, e-mail e telefone com DDD são validados. IDs são strings geradas pelo serviço.

Exemplo de venda a prazo:

```json
{
  "customerId": "c1",
  "items": [{ "productId": "p1", "quantity": 2 }],
  "payment": { "method": "on_account", "dueDate": "2026-12-10" }
}
```

Formas de pagamento:

| `method` | Campos adicionais | Resultado |
| --- | --- | --- |
| `pix` | Nenhum | `paid` |
| `credit` | Nenhum | `paid` |
| `debit` | Nenhum | `paid` |
| `cash` | `amountTendered`, em reais, pelo menos o total | `paid`, com `change` calculado |
| `on_account` | Cliente existente e `dueDate` no formato `YYYY-MM-DD`, a partir de hoje | `pending` |

`Sale` retorna ID, número, instante ISO, cliente (ID ou `null` e nome histórico), itens com nome/código/preço unitário/quantidade/subtotal, total, pagamento, troco e situação. Dinheiro usa soma em centavos para evitar erros de ponto flutuante. Preços e totais são calculados no serviço a partir dos produtos; não são aceitos do cliente. A quantidade repetida de um produto é consolidada antes de verificar estoque.

Todas as validações são concluídas antes de registrar a venda e baixar o estoque. O histórico preserva nomes e preços mesmo após edições ou exclusões dos cadastros. A exclusão de cliente com venda pendente é bloqueada. A API deverá manter essas regras em uma transação e definir idempotência para reenvios de venda. Um futuro adaptador HTTP deverá converter respostas de erro em `Error` com mensagem apropriada para os estados de erro existentes.

O fluxo simula o registro do recebimento confirmado pelo operador. Não processa pagamentos, não coleta dados de cartões, não gera Pix, documento fiscal ou parcelamento de cartão. A prazo representa uma dívida com vencimento único; baixa de débitos, autenticação e controle real de caixa ficam para próximas etapas.

## Verificação

`npm test` executa testes do serviço com Node Test Runner, compilando o TypeScript em memória. Abrange CRUD, códigos duplicados, dinheiro e troco, validação de estoque, atomicidade, quantidades repetidas, todos os meios de pagamento, prazo, proteção de cliente com débito e histórico imutável. Execute também `npm run lint` e `npm run build`.

Revisão no navegador: criação/edição/exclusão de produto; criação de cliente; venda de R$ 80,90 com recebimento de R$ 100,00 e troco de R$ 19,10; compra a prazo de R$ 38,00 com cliente e vencimento; consulta das duas vendas após navegação interna. Layout inspecionado em desktop e em 390 px, com rolagem interna das tabelas e sem transbordamento horizontal da página.
