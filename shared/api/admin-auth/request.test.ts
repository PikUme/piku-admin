import { describe, expect, it, vi } from "vitest";

import { createAdminAuthRequest } from "./request";

describe("createAdminAuthRequest", () => {
  it("uses credentialed JSON requests and injects the configured CSRF token", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ nextStep: "VERIFY_OTP" }));
    const request = createAdminAuthRequest({
      baseUrl: "https://api.example.com/",
      csrfCookieName: "csrf_token",
      csrfHeaderName: "csrf_token",
      cookieSource: () => "csrf_token=abc%20123",
      fetcher,
    });

    await request("/api/admin/auth/login", {
      method: "POST",
      body: { loginId: "admin_1", password: "Strong!234" },
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/api/admin/auth/login",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          csrf_token: "abc 123",
        },
        body: JSON.stringify({ loginId: "admin_1", password: "Strong!234" }),
      },
    );
  });

  it("omits the CSRF header for initialization", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const request = createAdminAuthRequest({
      baseUrl: "https://api.example.com",
      csrfCookieName: "csrf_token",
      csrfHeaderName: "csrf_header",
      fetcher,
      cookieSource: () => "",
    });

    await request("/api/admin/auth/csrf", { method: "POST", csrf: false });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/api/admin/auth/csrf",
      expect.objectContaining({
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("rejects unsafe requests before fetch when the CSRF cookie is missing", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const request = createAdminAuthRequest({
      baseUrl: "https://api.example.com",
      csrfCookieName: "csrf_token",
      csrfHeaderName: "csrf_header",
      cookieSource: () => "",
      fetcher,
    });

    await expect(
      request("/api/admin/auth/login", { method: "POST", body: {} }),
    ).rejects.toThrow("CSRF 쿠키를 찾을 수 없습니다.");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("throws a typed RFC 9457 error", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        {
          type: "https://pikume.com/problems/admin/invalid-credentials",
          title: "Unauthorized",
          status: 401,
          detail: "로그인 정보가 올바르지 않습니다.",
          instance: "/api/admin/auth/login",
          fieldErrors: { loginId: "아이디를 확인해 주세요." },
        },
        { status: 401, headers: { "Content-Type": "application/problem+json" } },
      ),
    );
    const request = createAdminAuthRequest({
      baseUrl: "https://api.example.com",
      csrfCookieName: "csrf_token",
      csrfHeaderName: "csrf_header",
      cookieSource: () => "csrf_token=token",
      fetcher,
    });

    await expect(
      request("/api/admin/auth/login", { method: "POST", body: {} }),
    ).rejects.toMatchObject({
      name: "AdminApiError",
      message: "로그인 정보가 올바르지 않습니다.",
      status: 401,
      problemType: "https://pikume.com/problems/admin/invalid-credentials",
      fieldErrors: { loginId: "아이디를 확인해 주세요." },
    });
  });
});
