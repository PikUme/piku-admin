import { expect, it } from "vitest";

it("handles admin API requests without reaching the backend", async () => {
  const response = await fetch(
    "http://localhost:8080/api/admin/auth/csrf",
    { method: "POST" },
  );

  expect(response.status).toBe(204);
});

it("rejects requests without an MSW handler", async () => {
  await expect(
    fetch("http://localhost:8080/api/not-registered"),
  ).rejects.toThrow();
});
