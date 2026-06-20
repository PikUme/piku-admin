import { describe, expect, it, vi } from "vitest";

import type { AdminAuthRequest } from "@/shared/api/admin-auth/request";

import { createHttpOnboardingApi } from "./http-api";

describe("createHttpOnboardingApi", () => {
  it("uses backend payloads and converts the provisioning URI to a QR data URL", async () => {
    const request = vi
      .fn<AdminAuthRequest>()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ nextStep: "SET_CREDENTIALS" })
      .mockResolvedValueOnce({ nextStep: "REGISTER_OTP" })
      .mockResolvedValueOnce({
        issuer: "Pikume Ops",
        accountName: "admin_1",
        provisioningUri: "otpauth://totp/Pikume%20Ops:admin_1?secret=ABC",
        manualEntryKey: "JBSWY3DPEHPK3PXP",
      })
      .mockResolvedValueOnce({ authenticated: true, admin: {} });
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
      issuer: "Pikume Ops",
      accountName: "admin_1",
      qrCodeDataUrl: "data:image/png;base64,qr",
      manualEntryKey: "JBSWY3DPEHPK3PXP",
    });
    await api.verifyOtp({ otpCode: "123456" });

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
});
