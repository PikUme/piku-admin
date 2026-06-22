import { describe, expect, it, vi } from "vitest";

import { createLoginApi } from ".";

describe("createLoginApi", () => {
  it("uses the remote HTTP adapter by default", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const api = createLoginApi({
      fetcher,
    });

    await api.initializeCsrf();

    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("uses mock mode only when explicitly requested", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const api = createLoginApi({
      mode: "mock",
      fetcher,
      mockDelay: 0,
    });

    await api.initializeCsrf();

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("requires a backend URL in remote mode", () => {
    expect(() => createLoginApi({ mode: "remote" })).toThrow(
      "NEXT_PUBLIC_BACKEND_BASE_URL 환경변수가 필요합니다.",
    );
  });

  it("uses configured CSRF names in remote mode", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const api = createLoginApi({
      mode: "remote",
      csrfCookieName: "custom_cookie",
      csrfHeaderName: "X-CUSTOM-CSRF",
      cookieSource: () => "custom_cookie=token",
      fetcher,
    });

    await api.initializeCsrf();

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/api/admin/auth/csrf",
      expect.any(Object),
    );
  });
});
