import { describe, expect, it } from "vitest";

import { createMockLoginApi } from "./mock-api";

describe("createMockLoginApi", () => {
  it("completes the login contract deterministically", async () => {
    const api = createMockLoginApi({ delay: 0 });

    await expect(api.initializeCsrf()).resolves.toBeUndefined();
    await expect(
      api.login({ loginId: "admin_1", password: "Strong!234" }),
    ).resolves.toMatchObject({
      nextStep: "VERIFY_OTP",
      loginId: "admin_1",
    });
    await expect(api.verifyOtp({ otpCode: "123456" })).resolves.toMatchObject({
      authenticated: true,
      admin: { loginId: "admin_1" },
    });
  });
});
