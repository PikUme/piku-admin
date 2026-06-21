import { describe, expect, it } from "vitest";

import { ADMIN_AUTH_NEXT_STEP, ADMIN_ROLE } from "./contracts";
import { parseAdminNextStep, parseAuthenticatedAdmin } from "./response";

describe("admin auth response parsers", () => {
  it("accepts only the expected centralized next step", () => {
    expect(
      parseAdminNextStep(
        { nextStep: "VERIFY_OTP" },
        ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
      ),
    ).toEqual({ nextStep: ADMIN_AUTH_NEXT_STEP.VERIFY_OTP });

    expect(() =>
      parseAdminNextStep(
        { nextStep: "SET_CREDENTIALS" },
        ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
      ),
    ).toThrow("관리자 인증 응답의 다음 단계를 확인할 수 없습니다.");
  });

  it("accepts the top-level authenticated admin contract", () => {
    expect(
      parseAuthenticatedAdmin({
        nickname: "운영자",
        role: ADMIN_ROLE.SUPER_ADMIN,
      }),
    ).toEqual({ nickname: "운영자", role: ADMIN_ROLE.SUPER_ADMIN });

    expect(() =>
      parseAuthenticatedAdmin({
        authenticated: true,
        admin: { nickname: "운영자", role: "SUPER_ADMIN" },
      }),
    ).toThrow("관리자 인증 완료 응답을 확인할 수 없습니다.");
  });
});
