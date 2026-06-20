import type { OnboardingApi } from "./contracts";
import { createHttpOnboardingApi } from "./http-api";
import { createMockOnboardingApi } from "./mock-api";
import { createAdminAuthRequest } from "@/shared/api/admin-auth/request";

interface CreateOnboardingApiOptions {
  mode?: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
  mockDelay?: number;
  csrfCookieName?: string;
  csrfHeaderName?: string;
  cookieSource?: () => string;
}

export function createOnboardingApi(
  options: CreateOnboardingApiOptions = {},
): OnboardingApi {
  const mode = options.mode ?? process.env.NEXT_PUBLIC_API_MODE ?? "mock";

  if (mode !== "remote") {
    return createMockOnboardingApi({ delay: options.mockDelay });
  }

  const baseUrl =
    options.baseUrl ?? process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "";

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL 환경변수가 필요합니다.");
  }

  const request = createAdminAuthRequest({
    baseUrl,
    fetcher: options.fetcher,
    csrfCookieName:
      options.csrfCookieName ??
      process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ??
      "csrf_token",
    csrfHeaderName:
      options.csrfHeaderName ??
      process.env.NEXT_PUBLIC_CSRF_HEADER_NAME ??
      "csrf_token",
    cookieSource: options.cookieSource,
  });

  return createHttpOnboardingApi(request);
}

export type { OnboardingApi } from "./contracts";
