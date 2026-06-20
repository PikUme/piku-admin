import type {
  CredentialsForm,
  TemporaryLoginInput,
} from "../api/contracts";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const LOGIN_ID_PATTERN = /^[a-z0-9_-]{4,15}$/;
const OTP_PATTERN = /^\d{6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RULES = [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/];

export function validateTemporaryLogin(
  input: TemporaryLoginInput,
): FieldErrors<TemporaryLoginInput> {
  const errors: FieldErrors<TemporaryLoginInput> = {};

  if (!input.email.trim()) {
    errors.email = "이메일을 입력해 주세요.";
  } else if (!EMAIL_PATTERN.test(input.email)) {
    errors.email = "유효한 이메일을 입력해 주세요.";
  }

  if (!input.temporaryPassword) {
    errors.temporaryPassword = "임시 비밀번호를 입력해 주세요.";
  }

  return errors;
}

export function validateCredentials(
  input: CredentialsForm,
): FieldErrors<CredentialsForm> {
  const errors: FieldErrors<CredentialsForm> = {};

  if (!LOGIN_ID_PATTERN.test(input.loginId)) {
    errors.loginId =
      "4~15자의 영문 소문자, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.";
  }

  const hasValidLength = input.password.length >= 8 && input.password.length <= 20;
  const meetsEveryRule = PASSWORD_RULES.every((rule) => rule.test(input.password));

  if (!hasValidLength || !meetsEveryRule) {
    errors.password =
      "8~20자의 영문 대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해 주세요.";
  } else if (input.password === input.loginId) {
    errors.password = "아이디와 동일한 비밀번호는 사용할 수 없습니다.";
  }

  if (input.confirmation !== input.password) {
    errors.confirmation = "비밀번호가 일치하지 않습니다.";
  }

  return errors;
}

export function validateOtp(code: string): string | undefined {
  return OTP_PATTERN.test(code)
    ? undefined
    : "인증 코드는 6자리 숫자여야 합니다.";
}
