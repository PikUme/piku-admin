import { createAdminAuthRequest, type AdminAuthRequest } from "./request";

export type AdminApiMode = "mock" | "remote";

export const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8080";

export interface AdminAuthClientOptions {
  mode?: string;
  csrfCookieName?: string;
  csrfHeaderName?: string;
  cookieSource?: () => string;
  fetcher?: typeof fetch;
}

export function resolveAdminApiMode(explicitMode?: string): AdminApiMode {
  const mode = explicitMode ?? process.env.NEXT_PUBLIC_API_MODE ?? "remote";
  if (mode === "mock" || mode === "remote") return mode;
  throw new Error(`지원하지 않는 관리자 API 모드입니다: ${mode}`);
}

export function createConfiguredAdminAuthRequest(
  options: AdminAuthClientOptions = {},
): AdminAuthRequest {

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL 환경변수가 필요합니다.");
  }

  return createAdminAuthRequest({
    csrfCookieName:
      options.csrfCookieName ??
      process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ??
      "csrf_token",
    csrfHeaderName:
      options.csrfHeaderName ??
      process.env.NEXT_PUBLIC_CSRF_HEADER_NAME ??
      "csrf_header",
    cookieSource: options.cookieSource,
    fetcher: options.fetcher,
  });
}
