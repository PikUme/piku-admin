import { describe, expect, it } from "vitest";

import { createOnboardingApi } from ".";

describe("createOnboardingApi", () => {
  it("always uses the HTTP adapter", async () => {
    const api = createOnboardingApi();

    await expect(api.initializeCsrf()).resolves.toBeUndefined();
  });
});
