import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import { clearTestCsrfCookie } from "./test/msw/handlers";
import { server } from "./test/msw/server";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  clearTestCsrfCookie();
});

afterAll(() => {
  server.close();
});
