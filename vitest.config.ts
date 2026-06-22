import path from "node:path";
import { defineConfig } from "vitest/config";

import { testAdminAuthEnv } from "./test/msw/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    env: testAdminAuthEnv,
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
