<div align="center">
  <a href="https://www.celc.org.br/">
    <img src="public/celc.svg" alt="C.E.L.C — Casa Espiritualista Luz do Caminho" width="130">
  </a>

  # C.E.L.C — Casa Espiritualista Luz do Caminho

  Portal institucional e sistema de gestão da **Casa Espiritualista Luz do Caminho**, reunindo informações, atividades, projetos sociais e módulos internos em uma experiência moderna e acessível.

  ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
  ![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
</div>

---

## 📋 Sobre o Projeto

A **Casa Espiritualista Luz do Caminho (C.E.L.C)** é uma instituição religiosa e assistencial fundada em 1977, dedicada à prática da caridade e ao desenvolvimento intelectual, emocional e espiritual. Este projeto moderniza sua presença digital, centralizando informações sobre atendimentos, agenda, escolas, terapias e projetos sociais, além de servir como base para módulos internos, como a **Livraria Humberto de Campos**.

### Objetivo

Oferecer à comunidade um portal claro e acolhedor para conhecer e acessar as atividades da C.E.L.C, ao mesmo tempo em que disponibiliza uma estrutura segura e escalável para a gestão das operações da instituição.

---

## ✨ Funcionalidades

- Landing page institucional responsiva
- Apresentação da casa, de seus atendimentos e projetos sociais
- Agenda de atividades e encontros
- Informações de localização, contato e redes sociais
- Acesso ao módulo da Livraria Humberto de Campos
- CRUD de produtos e clientes com busca e validações
- Frente de caixa com estoque, quantidades, totais, troco e pagamentos Pix, crédito, débito, dinheiro e a prazo
- Visão geral e histórico de vendas com detalhes e pagamentos pendentes

> A livraria usa pequenos JSONs fixos e serviços assíncronos tipados. As alterações ficam em memória e são restauradas ao recarregar a página. Os pagamentos são simulados. Consulte [telas, regras e contratos para a futura API](docs/livraria.md).

---

## 🧩 Pré-requisitos

Antes de iniciar, certifique-se de possuir as ferramentas abaixo instaladas:

- [Node.js](https://nodejs.org/) 20 ou superior
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

---

## 📦 Instalação

Clone o repositório:

```bash
git clone https://github.com/RhuanLino/CELC-Web.git
```

Acesse a pasta do projeto:

```bash
cd CELC-Web
```

Instale as dependências:

```bash
npm install
```

Ao adicionar novos pacotes:

```bash
npm install <nome-do-pacote>
```

---

## ▶️ Executando o Projeto

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Outros comandos

| Comando | Descrição |
| --- | --- |
| `npm run build` | Gera e valida a versão de produção |
| `npm run start` | Executa a versão gerada pelo build |
| `npm run lint` | Analisa o código com ESLint |

---

## 🧭 Rotas Atuais

| Rota | Finalidade |
| --- | --- |
| `/` | Landing page institucional da C.E.L.C |
| `/livraria` | Visão geral da livraria |
| `/produtos` | CRUD e estoque de produtos da livraria |
| `/clientes` | CRUD de clientes da livraria |
| `/obreiros` | Área inicial para gestão de obreiros |
| `/caixa` | Frente de caixa e registro de vendas |
| `/vendas` | Histórico, detalhes e vendas a prazo |

Novas rotas institucionais e administrativas serão incluídas conforme os módulos forem implementados.

---

## 📁 Estrutura de Pastas

```text
📦 celc-web
 ┣ 📂 public
 ┃ ┣ 📜 celc.svg              # logo oficial da C.E.L.C
 ┃ ┣ 🖼️ celc-hero.jpg         # imagem principal da landing page
 ┃ ┗ 🖼️ celc-logo.png         # versão raster da marca
 ┣ 📂 src
 ┃ ┣ 📂 app                   # rotas do App Router
 ┃ ┃ ┣ 📂 caixa               # módulo de caixa da livraria
 ┃ ┃ ┣ 📂 obreiros            # gestão de obreiros
 ┃ ┃ ┣ 📂 produtos            # gestão de produtos
 ┃ ┃ ┣ 📜 globals.css         # tema e estilos globais
 ┃ ┃ ┣ 📜 layout.tsx          # layout raiz e metadados
 ┃ ┃ ┗ 📜 page.tsx            # landing page institucional
 ┃ ┣ 📂 components
 ┃ ┃ ┗ 📂 ui                  # componentes reutilizáveis de interface
 ┃ ┗ 📂 lib
 ┃   ┗ 📜 utils.ts            # funções auxiliares compartilhadas
 ┣ 📜 components.json         # configuração do shadcn
 ┣ 📜 next.config.ts          # configuração do Next.js
 ┣ 📜 package.json            # dependências e scripts
 ┗ 📜 tsconfig.json           # configuração do TypeScript
```

### Estrutura sugerida para o futuro

Conforme o projeto crescer, a organização poderá evoluir para separar melhor o portal institucional, os módulos administrativos e as regras de negócio:

```text
📦 src
 ┣ 📂 app
 ┃ ┣ 📂 api                   # endpoints HTTP da aplicação
 ┃ ┣ 📂 institucional         # páginas e conteúdos públicos da C.E.L.C
 ┃ ┗ 📂 livraria              # rotas agrupadas do módulo da livraria
 ┃   ┣ 📂 caixa
 ┃   ┣ 📂 debitos
 ┃   ┣ 📂 obreiros
 ┃   ┗ 📂 produtos
 ┣ 📂 components
 ┃ ┣ 📂 institutional         # componentes do portal público
 ┃ ┣ 📂 livraria              # componentes específicos da livraria
 ┃ ┗ 📂 ui                    # componentes visuais genéricos
 ┣ 📂 data                    # dados JSON usados durante a prototipação
 ┣ 📂 hooks                   # hooks React compartilhados
 ┣ 📂 lib                     # serviços, utilitários e configurações
 ┣ 📂 schemas                 # validações e contratos com Zod
 ┗ 📂 types                   # tipos e interfaces compartilhados
```

Essa estrutura é uma referência para a evolução do sistema e deve ser adotada gradualmente, conforme cada módulo for implementado.

---

## 🛠️ Tecnologias

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn](https://ui.shadcn.com/) e Base UI
- [Lucide](https://lucide.dev/)
- React Hook Form e Zod
- Recharts

---

## 🌱 Fluxo de Branches

Usamos o **Git Flow** para a construção de branches.

### Inicializar o Git Flow

```bash
git flow init
```

- Branch de produção: `main`
- Branch da próxima versão: `develop`

> Antes de criar uma branch, volte para `develop` e execute `git pull` para trabalhar sobre a versão mais recente.

### Criar uma branch

```bash
git flow <tipo> start <numero_issue>_<nome_usuario>_<descricao>_<mes/ano>
```

### Tipos

- `feature` → novas funcionalidades
- `bugfix` → correções
- `release` → preparação de versão
- `hotfix` → correções urgentes em produção
- `support` → suporte a versões antigas

### Exemplos

```text
feature/200_rhuan_cadastro-produtos_dez/25
bugfix/320_rhuan_correcao-header_abr/26
```

---

## 📝 Padrão de Commits

Formato:

```text
#<numero_branch> @<usuario_github> <acao>: <descricao>
```

### Ações padronizadas

- `feat` → nova funcionalidade
- `fix` → correção de bug
- `chore` → manutenção
- `refactor` → refatoração
- `style` → ajustes visuais
- `docs` → documentação
- `test` → testes

### Exemplos

```text
#123 @RhuanLino feat: adiciona cadastro de produtos
#124 @lucas_andrade02 fix: corrige erro no caixa
#125 @RhuanLino docs: atualiza documentação
#126 @RhuanLino refactor: reorganiza componentes
```

---

## 📌 Boas Práticas

- Criar branches sempre seguindo o padrão definido
- Fazer commits pequenos e objetivos
- Escrever descrições claras
- Atualizar a branch local antes de iniciar uma tarefa
- Executar `npm run lint` e `npm run build` antes de enviar alterações
- Abrir Pull Requests para revisão
- Evitar commits diretos nas branches `main` e `develop`
- Nunca versionar senhas, tokens ou arquivos `.env` com dados reais

---

## 🤝 Colaboração

Para contribuir com o projeto:

1. Atualize a branch `develop`
2. Crie sua branch seguindo o padrão definido
3. Desenvolva e valide sua funcionalidade
4. Faça commits padronizados
5. Abra um Pull Request para revisão

---

## 📍 Contato

**Casa Espiritualista Luz do Caminho**<br>
Rua Araguaia, Quadra 12, Lotes 1 e 20<br>
Jardim Flamboyant — Luziânia, GO

- [Site institucional](https://www.celc.org.br/)
- [Instagram](https://www.instagram.com/celc1977/)
- [Facebook](https://www.facebook.com/celc1977)
- [YouTube](https://www.youtube.com/channel/UCbv1TqmUg9au-PHnRfDJdyA)

---

<div align="center">

Feito com dedicação para aproximar pessoas, conhecimento e caridade.

</div>
