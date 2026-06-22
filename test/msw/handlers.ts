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

  http.get(
    `${TEST_BACKEND_BASE_URL}/api/admin/dashboard`,
    () => {
      return HttpResponse.json({
        keyMetrics: {
          currentCumulativeMemberCount: 124592,
          cumulativeMemberCountSevenDaysAgo: 123114,
          recent30DayActiveUserCount: 45210,
          previous30DayActiveUserCount: 43139,
          currentAiPhotoSuccessCount: 892104,
          aiPhotoSuccessCountSevenDaysAgo: 793392,
          currentDiaryCreationCount: 542109,
          diaryCreationCountSevenDaysAgo: 481900,
        },
        dailyActiveUsers: [
          { date: "2026-06-16", dau: 5100 },
          { date: "2026-06-17", dau: 6000 },
          { date: "2026-06-18", dau: 7800 },
          { date: "2026-06-19", dau: 6900 },
          { date: "2026-06-20", dau: 10300 },
          { date: "2026-06-21", dau: 9400 },
          { date: "2026-06-22", dau: 12100 },
        ],
        aiPhotoGeneration: {
          successCount: 12402,
          failureCount: 1084,
        },
        weeklyActivity: [
          { periodStartDate: "2026-06-01", periodEndDate: "2026-06-07", newMemberCount: 340, diaryCreationCount: 560 },
          { periodStartDate: "2026-06-08", periodEndDate: "2026-06-14", newMemberCount: 410, diaryCreationCount: 460 },
          { periodStartDate: "2026-06-15", periodEndDate: "2026-06-21", newMemberCount: 680, diaryCreationCount: 890 },
          { periodStartDate: "2026-06-22", periodEndDate: "2026-06-28", newMemberCount: 590, diaryCreationCount: 760 },
        ],
        dailySummary: [
          { date: "2026-06-22", newMemberCount: 412, dau: 12100, diaryCreationCount: 8901, aiPhotoRequestCount: 12402 },
          { date: "2026-06-21", newMemberCount: 589, dau: 9400, diaryCreationCount: 10245, aiPhotoRequestCount: 15670 },
          { date: "2026-06-20", newMemberCount: 620, dau: 10300, diaryCreationCount: 11500, aiPhotoRequestCount: 17200 },
          { date: "2026-06-19", newMemberCount: 450, dau: 6900, diaryCreationCount: 9200, aiPhotoRequestCount: 13800 },
          { date: "2026-06-18", newMemberCount: 510, dau: 7800, diaryCreationCount: 8800, aiPhotoRequestCount: 14100 },
          { date: "2026-06-17", newMemberCount: 490, dau: 6000, diaryCreationCount: 9100, aiPhotoRequestCount: 13000 },
          { date: "2026-06-16", newMemberCount: 405, dau: 5100, diaryCreationCount: 8700, aiPhotoRequestCount: 12500 },
        ],
      });
    },
  ),
];
