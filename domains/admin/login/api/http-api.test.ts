import { describe, expect, it, vi } from "vitest";

import type { AdminAuthRequest } from "@/shared/api/admin-auth/request";
import {
  ADMIN_AUTH_NEXT_STEP,
  ADMIN_ROLE,
} from "@/shared/api/admin-auth/contracts";

import { createHttpLoginApi } from "./http-api";

describe("createHttpLoginApi", () => {
  it("initializes CSRF without attaching an existing CSRF token", async () => {
    const request = vi.fn<AdminAuthRequest>().mockResolvedValue(undefined);
    const api = createHttpLoginApi(request as unknown as AdminAuthRequest);

    await api.initializeCsrf();

    expect(request).toHaveBeenCalledWith("/api/admin/auth/csrf", {
      method: "POST",
      csrf: false,
    });
  });

  it("sends credentials and returns a VERIFY_OTP challenge", async () => {
    const challenge = {
      nextStep: ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
    };
    const request = vi.fn<AdminAuthRequest>().mockResolvedValue(challenge);
    const api = createHttpLoginApi(request as unknown as AdminAuthRequest);

    await expect(
      api.login({ loginId: "admin_1", password: "Strong!234" }),
    ).resolves.toEqual(challenge);
    expect(request).toHaveBeenCalledWith("/api/admin/auth/login", {
      method: "POST",
      body: { loginId: "admin_1", password: "Strong!234" },
    });
  });

  it("sends otpCode and returns the authenticated admin", async () => {
    const authentication = {
      nickname: "운영자",
      role: ADMIN_ROLE.OPERATOR,
    };
    const request = vi.fn<AdminAuthRequest>().mockResolvedValue(authentication);
    const api = createHttpLoginApi(request as unknown as AdminAuthRequest);

    await expect(api.verifyOtp({ otpCode: "123456" })).resolves.toEqual(
      authentication,
    );
    expect(request).toHaveBeenCalledWith("/api/admin/auth/otp/verify", {
      method: "POST",
      body: { otpCode: "123456" },
    });
  });

  it("rejects unexpected login transitions", async () => {
    const request = vi
      .fn<AdminAuthRequest>()
      .mockResolvedValue({ nextStep: "SET_CREDENTIALS" });
    const api = createHttpLoginApi(request as unknown as AdminAuthRequest);

    await expect(
      api.login({ loginId: "admin_1", password: "Strong!234" }),
    ).rejects.toThrow("관리자 인증 응답의 다음 단계를 확인할 수 없습니다.");
  });
});
