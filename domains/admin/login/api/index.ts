import {
  type AdminAuthClientOptions,
  createConfiguredAdminAuthRequest,
  resolveAdminApiMode,
} from "@/shared/api/admin-auth/client";

import type { LoginApi } from "./contracts";
import { createHttpLoginApi } from "./http-api";
import { createMockLoginApi } from "./mock-api";

interface CreateLoginApiOptions extends AdminAuthClientOptions {
  mockDelay?: number;
}

export function createLoginApi(options: CreateLoginApiOptions = {}): LoginApi {
  const mode = resolveAdminApiMode(options.mode);

  if (mode === "mock") {
    return createMockLoginApi({ delay: options.mockDelay });
  }

  return createHttpLoginApi(createConfiguredAdminAuthRequest(options));
}

export type { LoginApi } from "./contracts";
