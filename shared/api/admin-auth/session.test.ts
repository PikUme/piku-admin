import { beforeEach, describe, expect, it } from "vitest";

import { ADMIN_ROLE } from "./contracts";
import {
  AUTHENTICATED_ADMIN_STORAGE_KEY,
  clearAuthenticatedAdmin,
  readAuthenticatedAdmin,
  saveAuthenticatedAdmin,
} from "./session";

describe("authenticated admin session", () => {
  beforeEach(() => sessionStorage.clear());

  it("round-trips the authenticated admin in sessionStorage", () => {
    saveAuthenticatedAdmin(
      { nickname: "최고 관리자", role: ADMIN_ROLE.SUPER_ADMIN },
      sessionStorage,
    );

    expect(readAuthenticatedAdmin(sessionStorage)).toEqual({
      nickname: "최고 관리자",
      role: ADMIN_ROLE.SUPER_ADMIN,
    });
  });

  it("removes malformed or unsupported stored values", () => {
    sessionStorage.setItem(
      AUTHENTICATED_ADMIN_STORAGE_KEY,
      JSON.stringify({ nickname: "위조", role: "ROOT" }),
    );

    expect(readAuthenticatedAdmin(sessionStorage)).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it("clears a previously authenticated admin", () => {
    saveAuthenticatedAdmin(
      { nickname: "운영자", role: ADMIN_ROLE.OPERATOR },
      sessionStorage,
    );
    clearAuthenticatedAdmin(sessionStorage);

    expect(readAuthenticatedAdmin(sessionStorage)).toBeNull();
  });
});
