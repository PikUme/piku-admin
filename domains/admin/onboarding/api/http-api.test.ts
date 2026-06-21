import { describe, expect, it, vi } from "vitest";

import type { AdminAuthRequest } from "@/shared/api/admin-auth/request";
import {
  ADMIN_AUTH_NEXT_STEP,
  ADMIN_ROLE,
} from "@/shared/api/admin-auth/contracts";

import { createHttpOnboardingApi } from "./http-api";

describe("createHttpOnboardingApi", () => {
  it("uses backend payloads and converts the provisioning URI to a QR data URL", async () => {
    const request = vi
      .fn<AdminAuthRequest>()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        nextStep: ADMIN_AUTH_NEXT_STEP.SET_CREDENTIALS,
      })
      .mockResolvedValueOnce({ nextStep: ADMIN_AUTH_NEXT_STEP.REGISTER_OTP })
      .mockResolvedValueOnce({
        provisioningUri: "otpauth://totp/Pikume%20Ops:admin_1?secret=ABC",
        manualEntryKey: "JBSWY3DPEHPK3PXP",
      })
      .mockResolvedValueOnce({
        nickname: "운영자",
        role: ADMIN_ROLE.OPERATOR,
      });
    const qrEncoder = vi.fn().mockResolvedValue("data:image/png;base64,qr");
    const api = createHttpOnboardingApi(
      request as unknown as AdminAuthRequest,
      qrEncoder,
    );

    await api.initializeCsrf();
    await api.temporaryLogin({
      email: "admin@example.com",
      temporaryPassword: "temporary-password",
    });
    await api.updateCredentials({ loginId: "admin_1", password: "Strong!234" });
    await expect(api.startOtpRegistration()).resolves.toEqual({
      qrCodeDataUrl: "data:image/png;base64,qr",
      manualEntryKey: "JBSWY3DPEHPK3PXP",
    });
    await expect(api.verifyOtp({ otpCode: "123456" })).resolves.toEqual({
      nickname: "운영자",
      role: ADMIN_ROLE.OPERATOR,
    });

    expect(request).toHaveBeenNthCalledWith(1, "/api/admin/auth/csrf", {
      method: "POST",
      csrf: false,
    });
    expect(request).toHaveBeenNthCalledWith(
      2,
      "/api/admin/auth/temporary-login",
      {
        method: "POST",
        body: {
          email: "admin@example.com",
          temporaryPassword: "temporary-password",
        },
      },
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      "/api/admin/auth/onboarding/credentials",
      {
        method: "PATCH",
        body: { loginId: "admin_1", password: "Strong!234" },
      },
    );
    expect(request).toHaveBeenNthCalledWith(
      4,
      "/api/admin/auth/onboarding/otp",
      { method: "POST" },
    );
    expect(request).toHaveBeenNthCalledWith(
      5,
      "/api/admin/auth/onboarding/otp/verify",
      { method: "POST", body: { otpCode: "123456" } },
    );
    expect(qrEncoder).toHaveBeenCalledWith(
      "otpauth://totp/Pikume%20Ops:admin_1?secret=ABC",
    );
  });

  it("rejects malformed OTP registration responses", async () => {
    const request = vi.fn<AdminAuthRequest>().mockResolvedValue({ secret: "x" });
    const api = createHttpOnboardingApi(
      request as unknown as AdminAuthRequest,
      vi.fn(),
    );

    await expect(api.startOtpRegistration()).rejects.toThrow(
      "OTP 등록 응답 형식을 확인할 수 없습니다.",
    );
  });

  it("rejects an unexpected temporary-login next step", async () => {
    const request = vi
      .fn<AdminAuthRequest>()
      .mockResolvedValue({ nextStep: ADMIN_AUTH_NEXT_STEP.VERIFY_OTP });
    const api = createHttpOnboardingApi(
      request as unknown as AdminAuthRequest,
      vi.fn(),
    );

    await expect(
      api.temporaryLogin({
        email: "admin@example.com",
        temporaryPassword: "temporary-password",
      }),
    ).rejects.toThrow(
      "관리자 인증 응답의 다음 단계를 확인할 수 없습니다.",
    );
  });
});
