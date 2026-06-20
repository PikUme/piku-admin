import { describe, expect, it } from "vitest";

import {
  validateCredentials,
  validateOtp,
  validateTemporaryLogin,
} from "./validation";

describe("validateTemporaryLogin", () => {
  it("requires both temporary credentials", () => {
    expect(
      validateTemporaryLogin({ email: "", temporaryPassword: "" }),
    ).toEqual({
      email: "이메일을 입력해 주세요.",
      temporaryPassword: "임시 비밀번호를 입력해 주세요.",
    });
  });

  it("accepts non-empty temporary credentials", () => {
    expect(
      validateTemporaryLogin({
        email: "admin@example.com",
        temporaryPassword: "temporary-password",
      }),
    ).toEqual({});
  });
});

describe("validateCredentials", () => {
  it("accepts valid credentials", () => {
    expect(
      validateCredentials({
        loginId: "admin_1",
        password: "Strong!234",
        confirmation: "Strong!234",
      }),
    ).toEqual({});
  });

  it.each(["abc", "Admin", "admin.user", "abcdefghijklmnop"])(
    "rejects invalid login ID %s",
    (loginId) => {
      expect(
        validateCredentials({
          loginId,
          password: "Strong!234",
          confirmation: "Strong!234",
        }).loginId,
      ).toBe("4~15자의 영문 소문자, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.");
    },
  );

  it.each([
    "Short1!",
    "NOLOWERCASE1!",
    "nouppercase1!",
    "NoNumber!!",
    "NoSpecial123",
    "WayTooLongPassword123!",
  ])("rejects weak password %s", (password) => {
    expect(
      validateCredentials({
        loginId: "admin_1",
        password,
        confirmation: password,
      }).password,
    ).toBeDefined();
  });

  it("rejects a password equal to the login ID", () => {
    expect(
      validateCredentials({
        loginId: "admin-1!A",
        password: "admin-1!A",
        confirmation: "admin-1!A",
      }).password,
    ).toBeDefined();
  });

  it("requires matching password confirmation", () => {
    expect(
      validateCredentials({
        loginId: "admin_1",
        password: "Strong!234",
        confirmation: "Different!234",
      }).confirmation,
    ).toBe("비밀번호가 일치하지 않습니다.");
  });
});

describe("validateOtp", () => {
  it("accepts exactly six digits", () => {
    expect(validateOtp("123456")).toBeUndefined();
  });

  it.each(["", "12345", "1234567", "12a456"])(
    "rejects invalid OTP %s",
    (code) => {
      expect(validateOtp(code)).toBe("인증 코드는 6자리 숫자여야 합니다.");
    },
  );
});
