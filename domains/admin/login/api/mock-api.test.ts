import { describe, expect, it } from "vitest";

import {
  ADMIN_AUTH_NEXT_STEP,
  ADMIN_ROLE,
} from "@/shared/api/admin-auth/contracts";

import { createMockLoginApi } from "./mock-api";

describe("createMockLoginApi", () => {
  it("completes the login contract deterministically", async () => {
    const api = createMockLoginApi({ delay: 0 });

    await expect(api.initializeCsrf()).resolves.toBeUndefined();
    await expect(
      api.login({ loginId: "admin_1", password: "Strong!234" }),
    ).resolves.toEqual({
      nextStep: ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
    });
    await expect(api.verifyOtp({ otpCode: "123456" })).resolves.toEqual({
      nickname: "Pikume 관리자",
      role: ADMIN_ROLE.SUPER_ADMIN,
    });
  });
});
