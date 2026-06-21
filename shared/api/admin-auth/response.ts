import {
  AdminApiError,
  type AdminAuthNextStep,
  type AuthenticatedAdmin,
  isAuthenticatedAdmin,
} from "./contracts";

export function parseAdminNextStep<T extends AdminAuthNextStep>(
  value: unknown,
  expected: T,
): { nextStep: T } {
  if (
    typeof value === "object" &&
    value !== null &&
    "nextStep" in value &&
    value.nextStep === expected
  ) {
    return { nextStep: expected };
  }

  throw new AdminApiError(
    "관리자 인증 응답의 다음 단계를 확인할 수 없습니다.",
  );
}

export function parseAuthenticatedAdmin(value: unknown): AuthenticatedAdmin {
  if (isAuthenticatedAdmin(value)) return value;
  throw new AdminApiError("관리자 인증 완료 응답을 확인할 수 없습니다.");
}
