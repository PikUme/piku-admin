import {
  type AdminAuthClientOptions,
  createConfiguredAdminAuthRequest,
} from "@/shared/api/admin-auth/client";

import type { LoginApi } from "./contracts";
import { createHttpLoginApi } from "./http-api";

export function createLoginApi(options: AdminAuthClientOptions = {}): LoginApi {
  return createHttpLoginApi(createConfiguredAdminAuthRequest(options));
}

export type { LoginApi } from "./contracts";
