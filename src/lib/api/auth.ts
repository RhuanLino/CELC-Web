import { api } from "./client";

export interface AuthCredentials {
  username: string;
  senha: string;
}

export interface RegisterInput {
  nome: string;
  username: string;
  email: string;
  senha: string;
  nomeEspiritual?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  telefone?: string;
  estadoCivil?: string;
  medium?: string;
  cidade?: string;
  uf?: string;
}

export interface AuthTokenResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  [key: string]: unknown;
}

export interface RegisterResponse {
  sucesso?: boolean;
  mensagem?: string;
  [key: string]: unknown;
}

export function login(input: AuthCredentials) {
  return api.post<AuthTokenResponse>("/auth/login", input, { withAuth: false });
}

export function register(input: RegisterInput) {
  return api.post<RegisterResponse>("/auth/cadastro", input, { withAuth: false });
}

export function authTokenFrom(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  const token = record.token ?? record.access_token ?? record.accessToken;
  return typeof token === "string" ? token : "";
}
