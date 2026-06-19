import type { OnboardingApi } from "./contracts";
import { createHttpOnboardingApi } from "./http-api";
import { createMockOnboardingApi } from "./mock-api";

interface CreateOnboardingApiOptions {
  mode?: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
  mockDelay?: number;
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

  return createHttpOnboardingApi(baseUrl, options.fetcher);
}

export type { OnboardingApi } from "./contracts";
