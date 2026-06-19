import { describe, expect, it } from "vitest";

import { createMockOnboardingApi } from "./mock-api";

describe("createMockOnboardingApi", () => {
  it("completes the onboarding contract with deterministic OTP data", async () => {
    const api = createMockOnboardingApi({ delay: 0 });

    await expect(api.initializeCsrf()).resolves.toBeUndefined();
    await expect(
      api.temporaryLogin({ temporaryId: "temp.user.123", temporaryPassword: "secret" }),
    ).resolves.toBeUndefined();
    await expect(
      api.updateCredentials({ loginId: "admin_1", password: "Strong!234" }),
    ).resolves.toBeUndefined();
    await expect(api.startOtpRegistration()).resolves.toEqual({
      qrCodeDataUrl: expect.stringMatching(/^data:image\/svg\+xml/),
      manualEntryKey: "JBSWY3DPEHPK3PXP",
    });
    await expect(api.verifyOtp({ code: "123456" })).resolves.toBeUndefined();
  });
});
