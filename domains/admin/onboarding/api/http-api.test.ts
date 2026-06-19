import { describe, expect, it, vi } from "vitest";

import { OnboardingApiError } from "./contracts";
import { createHttpOnboardingApi } from "./http-api";

describe("createHttpOnboardingApi", () => {
  it("calls every onboarding endpoint with credentials included", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        Response.json({
          qrCodeDataUrl: "data:image/svg+xml,qr",
          manualEntryKey: "JBSWY3DPEHPK3PXP",
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = createHttpOnboardingApi("https://api.example.com/", fetcher);

    await api.initializeCsrf();
    await api.temporaryLogin({
      temporaryId: "temp.admin",
      temporaryPassword: "temporary-password",
    });
    await api.updateCredentials({ loginId: "admin_1", password: "Strong!234" });
    await api.startOtpRegistration();
    await api.verifyOtp({ code: "123456" });

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "https://api.example.com/api/admin/auth/csrf",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      "https://api.example.com/api/admin/auth/temporary-login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          temporaryId: "temp.admin",
          temporaryPassword: "temporary-password",
        }),
      }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      3,
      "https://api.example.com/api/admin/auth/onboarding/credentials",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ loginId: "admin_1", password: "Strong!234" }),
      }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      4,
      "https://api.example.com/api/admin/auth/onboarding/otp",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      5,
      "https://api.example.com/api/admin/auth/onboarding/otp/verify",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ code: "123456" }),
      }),
    );

    for (const [, init] of fetcher.mock.calls) {
      expect(init?.headers).toEqual({ "Content-Type": "application/json" });
      expect(init?.credentials).toBe("include");
    }
  });

  it("normalizes backend failures", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ message: "임시 계정 정보가 올바르지 않습니다." }, { status: 401 }),
      );
    const api = createHttpOnboardingApi("https://api.example.com", fetcher);

    await expect(
      api.temporaryLogin({ temporaryId: "wrong", temporaryPassword: "wrong" }),
    ).rejects.toEqual(
      new OnboardingApiError("임시 계정 정보가 올바르지 않습니다.", 401),
    );
  });

  it("rejects malformed OTP registration responses", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ secret: "x" }));
    const api = createHttpOnboardingApi("https://api.example.com", fetcher);

    await expect(api.startOtpRegistration()).rejects.toThrow(
      "OTP 등록 응답 형식을 확인할 수 없습니다.",
    );
  });
});
