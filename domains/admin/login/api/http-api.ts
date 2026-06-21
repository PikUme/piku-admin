import { ADMIN_AUTH_NEXT_STEP } from "@/shared/api/admin-auth/contracts";
import type { AdminAuthRequest } from "@/shared/api/admin-auth/request";
import {
  parseAdminNextStep,
  parseAuthenticatedAdmin,
} from "@/shared/api/admin-auth/response";

import type { LoginApi } from "./contracts";

export function createHttpLoginApi(request: AdminAuthRequest): LoginApi {
  return {
    async initializeCsrf() {
      await request("/api/admin/auth/csrf", { method: "POST", csrf: false });
    },
    async login(input) {
      return parseAdminNextStep(
        await request("/api/admin/auth/login", {
          method: "POST",
          body: input,
        }),
        ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
      );
    },
    async verifyOtp(input) {
      return parseAuthenticatedAdmin(
        await request("/api/admin/auth/otp/verify", {
          method: "POST",
          body: input,
        }),
      );
    },
  };
}
