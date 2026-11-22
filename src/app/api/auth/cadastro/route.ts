import { NextResponse } from "next/server";
import { register, type RegisterInput } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const nome = text(body.nome);
  const username = text(body.username);
  const email = text(body.email);
  const senha = typeof body.senha === "string" ? body.senha : "";

  if (!nome || !username || !email || !senha) {
    return NextResponse.json(
      { message: "Informe nome, usuário, e-mail e senha." },
      { status: 400 },
    );
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ message: "Informe um e-mail válido." }, { status: 400 });
  }

  if (senha.length < 6) {
    return NextResponse.json(
      { message: "A senha deve ter pelo menos 6 caracteres." },
      { status: 400 },
    );
  }

  const input: RegisterInput = {
    nome,
    username,
    email,
    senha,
    nomeEspiritual: text(body.nomeEspiritual) || undefined,
    cpf: text(body.cpf) || undefined,
    rg: text(body.rg) || undefined,
    dataNascimento: text(body.dataNascimento) || undefined,
    telefone: text(body.telefone) || undefined,
    estadoCivil: text(body.estadoCivil) || undefined,
    medium: text(body.medium) || undefined,
    cidade: text(body.cidade) || undefined,
    uf: text(body.uf).toUpperCase() || undefined,
  };

  try {
    const data = await register(input);

    if (data?.sucesso === false) {
      return NextResponse.json(
        { message: data.mensagem ?? "Não foi possível concluir o cadastro." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: data?.mensagem ?? "Cadastro realizado com sucesso!",
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const status = error.status === 401 ? 400 : error.status;
      if (status >= 400 && status < 500) {
        return NextResponse.json({ message: error.message }, { status });
      }
    }
    return NextResponse.json(
      { message: "Não foi possível contatar o serviço de cadastro." },
      { status: 502 },
    );
  }
}
