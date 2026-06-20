import { describe, expect, it } from "vitest";

import { createMockOnboardingApi } from "./mock-api";

describe("createMockOnboardingApi", () => {
  it("completes the onboarding contract with deterministic OTP data", async () => {
    const api = createMockOnboardingApi({ delay: 0 });

    await expect(api.initializeCsrf()).resolves.toBeUndefined();
    await expect(
      api.temporaryLogin({ email: "admin@example.com", temporaryPassword: "secret" }),
    ).resolves.toBeUndefined();
    await expect(
      api.updateCredentials({ loginId: "admin_1", password: "Strong!234" }),
    ).resolves.toBeUndefined();
    await expect(api.startOtpRegistration()).resolves.toEqual({
      issuer: "Pikume Ops",
      accountName: "admin_1",
      qrCodeDataUrl: expect.stringMatching(/^data:image\/svg\+xml/),
      manualEntryKey: "JBSWY3DPEHPK3PXP",
    });
    await expect(api.verifyOtp({ otpCode: "123456" })).resolves.toBeUndefined();
  });
});
