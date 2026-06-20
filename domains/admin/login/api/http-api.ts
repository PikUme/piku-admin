import { AdminApiError } from "@/shared/api/admin-auth/contracts";
import type { AdminAuthRequest } from "@/shared/api/admin-auth/request";

import type {
  AdminAuthentication,
  AdminLoginChallenge,
  AdminProfile,
  LoginApi,
} from "./contracts";

function isAdminProfile(value: unknown): value is AdminProfile {
  return (
    typeof value === "object" &&
    value !== null &&
    "loginId" in value &&
    typeof value.loginId === "string" &&
    "nickname" in value &&
    typeof value.nickname === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "role" in value &&
    (value.role === "SUPER_ADMIN" ||
      value.role === "OPERATOR" ||
      value.role === "VIEWER")
  );
}

function parseChallenge(value: unknown): AdminLoginChallenge {
  if (
    typeof value === "object" &&
    value !== null &&
    "nextStep" in value &&
    value.nextStep === "VERIFY_OTP" &&
    isAdminProfile(value)
  ) {
    return value as AdminLoginChallenge;
  }

  throw new AdminApiError("로그인 응답의 다음 단계를 확인할 수 없습니다.");
}

function parseAuthentication(value: unknown): AdminAuthentication {
  if (
    typeof value === "object" &&
    value !== null &&
    "authenticated" in value &&
    value.authenticated === true &&
    "admin" in value &&
    isAdminProfile(value.admin)
  ) {
    return value as AdminAuthentication;
  }

  throw new AdminApiError("관리자 인증 완료 응답을 확인할 수 없습니다.");
}

export function createHttpLoginApi(request: AdminAuthRequest): LoginApi {
  return {
    async initializeCsrf() {
      await request("/api/admin/auth/csrf", { method: "POST", csrf: false });
    },
    async login(input) {
      return parseChallenge(
        await request("/api/admin/auth/login", {
          method: "POST",
          body: input,
        }),
      );
    },
    async verifyOtp(input) {
      return parseAuthentication(
        await request("/api/admin/auth/otp/verify", {
          method: "POST",
          body: input,
        }),
      );
    },
  };
}
