import { api } from "./client";

export interface AuthCredentials {
  username: string;
  senha: string;
}

export interface RegisterInput extends AuthCredentials {
  [key: string]: unknown;
}

export interface AuthTokenResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  [key: string]: unknown;
}

export function login(input: AuthCredentials) {
  return api.post<AuthTokenResponse>("/auth/login", input, { withAuth: false });
}

export function register(input: RegisterInput) {
  return api.post<AuthTokenResponse>("/auth/register", input, { withAuth: false });
}

export function authTokenFrom(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  const token = record.token ?? record.access_token ?? record.accessToken;
  return typeof token === "string" ? token : "";
}
