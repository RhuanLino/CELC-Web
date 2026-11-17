import axios, { type AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";

const DEFAULT_API_URL =
  process.env.NODE_ENV === "production" ? "http://api:8080" : "http://localhost:8080";

export function apiBaseUrl(): string {
  const configured = process.env.API_URL?.trim() || process.env.AUTH_API_URL?.trim();
  return (configured || DEFAULT_API_URL).replace(/\/+$/, "");
}

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface RequestConfig
  extends Omit<AxiosRequestConfig, "url" | "baseURL" | "method" | "data" | "headers"> {
  withAuth?: boolean;
  headers?: Record<string, string>;
}

const http = axios.create({
  timeout: 10_000,
  headers: { Accept: "application/json" },
});

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  data?: unknown,
  config: RequestConfig = {},
): Promise<T> {
  const { withAuth = true, headers, ...rest } = config;
  const requestHeaders: Record<string, string> = { ...headers };

  if (withAuth) {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await http.request<T>({
      ...rest,
      baseURL: apiBaseUrl(),
      url: path,
      method,
      data,
      headers: requestHeaders,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export const api = {
  get: <T>(path: string, config?: RequestConfig) => request<T>("GET", path, undefined, config),
  post: <T>(path: string, data?: unknown, config?: RequestConfig) => request<T>("POST", path, data, config),
  put: <T>(path: string, data?: unknown, config?: RequestConfig) => request<T>("PUT", path, data, config),
  patch: <T>(path: string, data?: unknown, config?: RequestConfig) => request<T>("PATCH", path, data, config),
  delete: <T = void>(path: string, config?: RequestConfig) => request<T>("DELETE", path, undefined, config),
};

function messageFrom(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const message = record.message ?? record.error ?? record.detail;
  return typeof message === "string" && message.trim() ? message : null;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 502;
    const data = error.response?.data;
    const message =
      messageFrom(data) ??
      (status === 401
        ? "Sessão inválida ou expirada."
        : "Não foi possível comunicar com a API.");
    return new ApiError(message, status, data);
  }

  return new ApiError("Não foi possível comunicar com a API.", 502);
}
