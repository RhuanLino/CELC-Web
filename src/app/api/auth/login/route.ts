import { NextResponse } from "next/server";
import { authTokenFrom, login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { AUTH_COOKIE, sessionMaxAge, verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { username?: unknown; senha?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const senha = typeof body.senha === "string" ? body.senha : "";

  if (!username || !senha) {
    return NextResponse.json({ message: "Informe usuário e senha." }, { status: 400 });
  }

  let data: Awaited<ReturnType<typeof login>>;
  try {
    data = await login({ username, senha });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return NextResponse.json({ message: "Usuário ou senha inválidos." }, { status: 401 });
      }
      if (error.status >= 400 && error.status < 500) {
        return NextResponse.json({ message: error.message }, { status: error.status });
      }
    }
    return NextResponse.json({ message: "Não foi possível contatar o serviço de autenticação." }, { status: 502 });
  }

  const token = authTokenFrom(data);
  if (!token) {
    return NextResponse.json({ message: "O serviço de autenticação não retornou um token." }, { status: 502 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ message: "O token retornado é inválido ou expirou." }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge(payload),
  });

  return response;
}
