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

  it("requires CSRF environment names", () => {
    vi.stubEnv("NEXT_PUBLIC_CSRF_COOKIE_NAME", "");
    vi.stubEnv("NEXT_PUBLIC_CSRF_HEADER_NAME", "");

    expect(() => createConfiguredAdminAuthRequest()).toThrow(
      "NEXT_PUBLIC_CSRF_COOKIE_NAME 환경변수가 필요합니다.",
    );
  });

  it("centralizes the backend URL and CSRF names from env", async () => {
    vi.stubEnv("NEXT_PUBLIC_CSRF_COOKIE_NAME", "custom_csrf_cookie");
    vi.stubEnv("NEXT_PUBLIC_CSRF_HEADER_NAME", "x-custom-csrf");
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ nextStep: "VERIFY_OTP" }));
    const request = createConfiguredAdminAuthRequest({
      cookieSource: () => "custom_csrf_cookie=token",
      fetcher,
    });

    await request("/api/admin/auth/login", { method: "POST", body: {} });

    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/auth/login",
      expect.objectContaining({
        headers: expect.objectContaining({ "x-custom-csrf": "token" }),
      }),
    );
  });
});
