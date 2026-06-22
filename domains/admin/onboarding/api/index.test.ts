import { describe, expect, it, vi } from "vitest";

import { createOnboardingApi } from ".";

describe("createOnboardingApi", () => {
  it("uses the remote HTTP adapter by default", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const api = createOnboardingApi({
      fetcher,
    });

    await expect(api.initializeCsrf()).resolves.toBeUndefined();
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("uses mock mode only when explicitly requested", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const api = createOnboardingApi({
      mode: "mock",
      fetcher,
      mockDelay: 0,
    });

    await expect(api.initializeCsrf()).resolves.toBeUndefined();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("requires a base URL in remote mode", () => {
    expect(() => createOnboardingApi({ mode: "remote" })).toThrow(
      "NEXT_PUBLIC_BACKEND_BASE_URL 환경변수가 필요합니다.",
    );
  });

  it("uses the HTTP adapter in remote mode", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const api = createOnboardingApi({
      mode: "remote",
      fetcher,
    });

    await api.initializeCsrf();

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/api/admin/auth/csrf",
      expect.any(Object),
    );
  });
});
