import { describe, expect, it } from "vitest";

import { readCookie } from "./cookies";

describe("readCookie", () => {
  it("finds and URL-decodes the configured cookie", () => {
    expect(
      readCookie(
        "csrf_token",
        "theme=dark; csrf_token=token%20with%2Bsymbols; locale=ko",
      ),
    ).toBe("token with+symbols");
  });

  it("returns undefined when the cookie is absent", () => {
    expect(readCookie("csrf_token", "theme=dark")).toBeUndefined();
  });
});
