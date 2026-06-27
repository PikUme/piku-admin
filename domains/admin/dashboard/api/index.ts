import {
  type AdminAuthClientOptions,
  createConfiguredAdminAuthRequest,
} from "@/shared/api/admin-auth/client";
import type { DashboardApi } from "./contracts";
import { createHttpDashboardApi } from "./http-api";

export type { DashboardData } from "./contracts";

export function createDashboardApi(
  options: AdminAuthClientOptions = {},
): DashboardApi {
  return createHttpDashboardApi(createConfiguredAdminAuthRequest(options));
}
