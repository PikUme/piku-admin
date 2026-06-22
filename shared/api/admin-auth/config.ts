export interface AdminAuthConfigOptions {
  csrfCookieName?: string;
  csrfHeaderName?: string;
}

export interface AdminAuthConfig {
  csrfCookieName: string;
  csrfHeaderName: string;
}

export function getAdminAuthBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "";

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL 환경변수가 필요합니다.");
  }

  return baseUrl;
}

export function resolveAdminAuthConfig(
  options: AdminAuthConfigOptions = {},
): AdminAuthConfig {
  return {
    csrfCookieName:
      options.csrfCookieName ??
      process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ??
      "csrf_token",
    csrfHeaderName:
      options.csrfHeaderName ??
      process.env.NEXT_PUBLIC_CSRF_HEADER_NAME ??
      "csrf_header",
  };
}
