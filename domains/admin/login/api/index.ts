import { createAdminAuthRequest } from "@/shared/api/admin-auth/request";

import type { LoginApi } from "./contracts";
import { createHttpLoginApi } from "./http-api";
import { createMockLoginApi } from "./mock-api";

interface CreateLoginApiOptions {
  mode?: string;
  baseUrl?: string;
  csrfCookieName?: string;
  csrfHeaderName?: string;
  cookieSource?: () => string;
  fetcher?: typeof fetch;
  mockDelay?: number;
}

export function createLoginApi(options: CreateLoginApiOptions = {}): LoginApi {
  const mode = options.mode ?? process.env.NEXT_PUBLIC_API_MODE ?? "mock";

  if (mode !== "remote") {
    return createMockLoginApi({ delay: options.mockDelay });
  }

  const baseUrl =
    options.baseUrl ?? process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "";

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL 환경변수가 필요합니다.");
  }

  return createHttpLoginApi(
    createAdminAuthRequest({
      baseUrl,
      csrfCookieName:
        options.csrfCookieName ??
        process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ??
        "csrf_token",
      csrfHeaderName:
        options.csrfHeaderName ??
        process.env.NEXT_PUBLIC_CSRF_HEADER_NAME ??
        "csrf_token",
      cookieSource: options.cookieSource,
      fetcher: options.fetcher,
    }),
  );
}

export type { LoginApi } from "./contracts";
