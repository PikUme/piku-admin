import { afterEach, describe, expect, it, vi } from "vitest";

import { createConfiguredAdminAuthRequest } from "./client";

describe("admin auth client configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires a backend URL", () => {
    vi.stubEnv("NEXT_PUBLIC_BACKEND_BASE_URL", "");

    expect(() => createConfiguredAdminAuthRequest()).toThrow(
      "NEXT_PUBLIC_BACKEND_BASE_URL 환경변수가 필요합니다.",
    );
  });

  it("centralizes the backend URL and default CSRF names", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ nextStep: "VERIFY_OTP" }));
    const request = createConfiguredAdminAuthRequest({
      cookieSource: () => "csrf_token=token",
      fetcher,
    });

    await request("/api/admin/auth/login", { method: "POST", body: {} });

    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/auth/login",
      expect.objectContaining({
        headers: expect.objectContaining({ csrf_header: "token" }),
      }),
    );
  });
});
