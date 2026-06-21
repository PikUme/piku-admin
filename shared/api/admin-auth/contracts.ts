export const ADMIN_AUTH_NEXT_STEP = {
  VERIFY_OTP: "VERIFY_OTP",
  SET_CREDENTIALS: "SET_CREDENTIALS",
  REGISTER_OTP: "REGISTER_OTP",
} as const;

export type AdminAuthNextStep =
  (typeof ADMIN_AUTH_NEXT_STEP)[keyof typeof ADMIN_AUTH_NEXT_STEP];

export const ADMIN_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OPERATOR: "OPERATOR",
  VIEWER: "VIEWER",
} as const;

export type AdminRole = (typeof ADMIN_ROLE)[keyof typeof ADMIN_ROLE];

export interface AuthenticatedAdmin {
  nickname: string;
  role: AdminRole;
}

export function isAdminRole(value: unknown): value is AdminRole {
  return Object.values(ADMIN_ROLE).some((role) => role === value);
}

export function isAuthenticatedAdmin(
  value: unknown,
): value is AuthenticatedAdmin {
  return (
    typeof value === "object" &&
    value !== null &&
    "nickname" in value &&
    typeof value.nickname === "string" &&
    value.nickname.length > 0 &&
    "role" in value &&
    isAdminRole(value.role)
  );
}

export interface AdminApiProblem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  fieldErrors?: Record<string, string>;
}

export class AdminApiError extends Error {
  readonly status?: number;
  readonly problemType?: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(message: string, problem?: Partial<AdminApiProblem>) {
    super(message);
    this.name = "AdminApiError";
    this.status = problem?.status;
    this.problemType = problem?.type;
    this.fieldErrors = problem?.fieldErrors;
  }
}
