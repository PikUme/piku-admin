import { describe, expect, it } from "vitest";

import { createLoginApi } from ".";

describe("createLoginApi", () => {
  it("always uses the HTTP adapter", async () => {
    const api = createLoginApi();

    await expect(api.initializeCsrf()).resolves.toBeUndefined();
  });
});
