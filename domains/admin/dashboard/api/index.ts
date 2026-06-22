import { resolveAdminAuthConfig } from "@/shared/api/admin-auth/config";
import { createAdminAuthRequest } from "@/shared/api/admin-auth/request";
import type { DashboardApi } from "./contracts";
import { createHttpDashboardApi } from "./http-api";

export type { DashboardData } from "./contracts";

export function createDashboardApi(): DashboardApi {
  const config = resolveAdminAuthConfig();
  const request = createAdminAuthRequest({
    csrfCookieName: config.csrfCookieName,
    csrfHeaderName: config.csrfHeaderName,
  });
  return createHttpDashboardApi(request);
}
