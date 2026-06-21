import type { OnboardingApi } from "./contracts";
import { createHttpOnboardingApi } from "./http-api";
import { createMockOnboardingApi } from "./mock-api";
import {
  type AdminAuthClientOptions,
  createConfiguredAdminAuthRequest,
  resolveAdminApiMode,
} from "@/shared/api/admin-auth/client";

interface CreateOnboardingApiOptions extends AdminAuthClientOptions {
  mockDelay?: number;
}

export function createOnboardingApi(
  options: CreateOnboardingApiOptions = {},
): OnboardingApi {
  const mode = resolveAdminApiMode(options.mode);

  if (mode === "mock") {
    return createMockOnboardingApi({ delay: options.mockDelay });
  }

  return createHttpOnboardingApi(createConfiguredAdminAuthRequest(options));
}

export type { OnboardingApi } from "./contracts";
