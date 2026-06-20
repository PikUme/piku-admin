import type { LoginInput } from "../api/contracts";

export type LoginFieldErrors = Partial<Record<keyof LoginInput, string>>;

const LOGIN_ID_PATTERN = /^[a-z0-9_-]{4,15}$/;
const OTP_PATTERN = /^\d{6}$/;

export function validateLogin(input: LoginInput): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  if (!LOGIN_ID_PATTERN.test(input.loginId)) {
    errors.loginId =
      "4~15자의 영문 소문자, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.";
  }

  if (!input.password) {
    errors.password = "비밀번호를 입력해 주세요.";
  }

  return errors;
}

export function validateLoginOtp(otpCode: string): string | undefined {
  return OTP_PATTERN.test(otpCode)
    ? undefined
    : "인증 코드는 6자리 숫자여야 합니다.";
}
