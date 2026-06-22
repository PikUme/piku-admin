import { http, HttpResponse } from "msw";

import {
  ADMIN_AUTH_NEXT_STEP,
  ADMIN_ROLE,
} from "@/shared/api/admin-auth/contracts";

import {
  TEST_BACKEND_BASE_URL,
  TEST_CSRF_COOKIE_NAME,
} from "./config";

export { TEST_BACKEND_BASE_URL } from "./config";

export function clearTestCsrfCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TEST_CSRF_COOKIE_NAME}=; Max-Age=0; Path=/`;
}

function setTestCsrfCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TEST_CSRF_COOKIE_NAME}=test-csrf-token; Path=/`;
}

export const adminAuthHandlers = [
  http.post(`${TEST_BACKEND_BASE_URL}/api/admin/auth/csrf`, () => {
    setTestCsrfCookie();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${TEST_BACKEND_BASE_URL}/api/admin/auth/login`, () => {
    return HttpResponse.json({
      nextStep: ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
    });
  }),

  http.post(`${TEST_BACKEND_BASE_URL}/api/admin/auth/otp/verify`, () => {
    return HttpResponse.json({
      nickname: "테스트 관리자",
      role: ADMIN_ROLE.SUPER_ADMIN,
    });
  }),

  http.post(
    `${TEST_BACKEND_BASE_URL}/api/admin/auth/temporary-login`,
    () => {
      return HttpResponse.json({
        nextStep: ADMIN_AUTH_NEXT_STEP.SET_CREDENTIALS,
      });
    },
  ),

  http.patch(
    `${TEST_BACKEND_BASE_URL}/api/admin/auth/onboarding/credentials`,
    () => {
      return HttpResponse.json({
        nextStep: ADMIN_AUTH_NEXT_STEP.REGISTER_OTP,
      });
    },
  ),

  http.post(
    `${TEST_BACKEND_BASE_URL}/api/admin/auth/onboarding/otp`,
    () => {
      return HttpResponse.json({
        provisioningUri: "otpauth://totp/Piku:test-admin",
        manualEntryKey: "JBSWY3DPEHPK3PXP",
      });
    },
  ),

  http.post(
    `${TEST_BACKEND_BASE_URL}/api/admin/auth/onboarding/otp/verify`,
    () => {
      return HttpResponse.json({
        nickname: "테스트 관리자",
        role: ADMIN_ROLE.SUPER_ADMIN,
      });
    },
  ),
];
