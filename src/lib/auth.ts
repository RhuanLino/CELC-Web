import { jwtVerify, type JWTPayload } from "jose";

export const AUTH_COOKIE = "celc_session";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 8;

function encodedSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  return secret ? new TextEncoder().encode(secret) : null;
}

export async function verifyToken(token: string | undefined | null): Promise<JWTPayload | null> {
  const secret = encodedSecret();
  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export function sessionMaxAge(payload: JWTPayload): number {
  if (!payload.exp) return AUTH_COOKIE_MAX_AGE;
  const remaining = payload.exp - Math.floor(Date.now() / 1000);
  return Math.max(1, Math.min(remaining, 60 * 60 * 24 * 7));
}

export function safeNextPath(value: string | string[] | undefined): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/livraria";
  if (path === "/login" || path.startsWith("/login?") || path.startsWith("/api/")) return "/livraria";
  return path;
}
