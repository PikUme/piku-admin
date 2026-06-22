import type { OnboardingApi } from "./contracts";
import { createHttpOnboardingApi } from "./http-api";
import {
  type AdminAuthClientOptions,
  createConfiguredAdminAuthRequest,
} from "@/shared/api/admin-auth/client";

export function createOnboardingApi(
  options: AdminAuthClientOptions = {},
): OnboardingApi {
  return createHttpOnboardingApi(createConfiguredAdminAuthRequest(options));
}

export type { OnboardingApi } from "./contracts";
