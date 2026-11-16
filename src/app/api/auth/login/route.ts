import { NextResponse } from "next/server";
import { AUTH_COOKIE, sessionMaxAge, verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ message: "Informe e-mail e senha." }, { status: 400 });
  }

  const apiUrl = process.env.AUTH_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ message: "AUTH_API_URL não configurada no servidor." }, { status: 500 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl.replace(/\/+$/, "")}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json({ message: "Não foi possível contatar o serviço de autenticação." }, { status: 502 });
  }

  const data = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    const message = upstream.status === 401 ? "E-mail ou senha inválidos." : "O serviço de autenticação recusou a solicitação.";
    return NextResponse.json({ message }, { status: upstream.status === 401 ? 401 : 502 });
  }

  const token = typeof data?.token === "string" ? data.token : "";
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
