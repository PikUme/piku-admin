import type { AdminAuthRequest } from "@/shared/api/admin-auth/request";
import type { DashboardApi, DashboardData } from "./contracts";

export function createHttpDashboardApi(request: AdminAuthRequest): DashboardApi {
  return {
    async getDashboardData() {
      return request<DashboardData>("/api/admin/dashboard", { method: "GET" });
    },
  };
}
