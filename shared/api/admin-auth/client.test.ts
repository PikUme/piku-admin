import { describe, expect, it, vi } from "vitest";

import {
  createConfiguredAdminAuthRequest,
  resolveAdminApiMode,
} from "./client";

describe("admin auth client configuration", () => {
  it("uses remote mode by default and allows explicit mock mode", () => {
    expect(resolveAdminApiMode()).toBe("remote");
    expect(resolveAdminApiMode("mock")).toBe("mock");
  });

  it("centralizes the backend URL and default CSRF names", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ nextStep: "VERIFY_OTP" }));
    const request = createConfiguredAdminAuthRequest({
      baseUrl: "https://example.com/",
      cookieSource: () => "csrf_token=token",
      fetcher,
    });

    await request("/api/admin/auth/login", { method: "POST", body: {} });

    expect(fetcher).toHaveBeenCalledWith(
      "https://example.com/api/admin/auth/login",
      expect.objectContaining({
        headers: expect.objectContaining({ csrf_header: "token" }),
      }),
    );
  });
});
