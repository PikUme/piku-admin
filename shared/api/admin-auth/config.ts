export interface AdminAuthConfigOptions {
  csrfCookieName?: string;
  csrfHeaderName?: string;
}

export interface AdminAuthConfig {
  csrfCookieName: string;
  csrfHeaderName: string;
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} 환경변수가 필요합니다.`);
  }

  return value;
}

export function getAdminAuthBaseUrl(): string {
  return requireEnv(
    "NEXT_PUBLIC_BACKEND_BASE_URL",
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  );
}

export function resolveAdminAuthConfig(
  options: AdminAuthConfigOptions = {},
): AdminAuthConfig {
  return {
    csrfCookieName:
      options.csrfCookieName ??
      requireEnv(
        "NEXT_PUBLIC_CSRF_COOKIE_NAME",
        process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME,
      ),
    csrfHeaderName:
      options.csrfHeaderName ??
      requireEnv(
        "NEXT_PUBLIC_CSRF_HEADER_NAME",
        process.env.NEXT_PUBLIC_CSRF_HEADER_NAME,
      ),
  };
}
