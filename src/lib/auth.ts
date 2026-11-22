import { jwtVerify, type JWTPayload } from "jose";

export const AUTH_COOKIE = "celc_session";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 8;

function hmacKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) return null;

  try {
    const base64 = secret.replace(/-/g, "+").replace(/_/g, "/");
    return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  } catch {
    return new TextEncoder().encode(secret);
  }
}

function algorithmFor(key: Uint8Array): "HS256" | "HS384" | "HS512" {
  if (key.length >= 64) return "HS512";
  if (key.length >= 48) return "HS384";
  return "HS256";
}

export async function verifyToken(token: string | undefined | null): Promise<JWTPayload | null> {
  const key = hmacKey();
  if (!token || !key) return null;

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: [algorithmFor(key)] });
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
