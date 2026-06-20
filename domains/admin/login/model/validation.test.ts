import { describe, expect, it } from "vitest";

import { validateLogin, validateLoginOtp } from "./validation";

describe("validateLogin", () => {
  it("accepts a valid login ID and non-empty password", () => {
    expect(
      validateLogin({ loginId: "admin_1", password: "Strong!234" }),
    ).toEqual({});
  });

  it.each(["", "abc", "Admin", "admin.user", "abcdefghijklmnop"])(
    "rejects invalid login ID %s",
    (loginId) => {
      expect(validateLogin({ loginId, password: "secret" }).loginId).toBeDefined();
    },
  );

  it("requires a password", () => {
    expect(validateLogin({ loginId: "admin_1", password: "" }).password).toBe(
      "비밀번호를 입력해 주세요.",
    );
  });
});

describe("validateLoginOtp", () => {
  it("accepts exactly six digits", () => {
    expect(validateLoginOtp("123456")).toBeUndefined();
  });

  it.each(["", "12345", "1234567", "12a456"])(
    "rejects invalid OTP %s",
    (otpCode) => {
      expect(validateLoginOtp(otpCode)).toBe(
        "인증 코드는 6자리 숫자여야 합니다.",
      );
    },
  );
});
