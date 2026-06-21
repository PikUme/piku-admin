import {
  ADMIN_AUTH_NEXT_STEP,
  type AuthenticatedAdmin,
} from "@/shared/api/admin-auth/contracts";

export interface LoginInput {
  loginId: string;
  password: string;
}

export interface LoginOtpInput {
  otpCode: string;
}

export interface AdminLoginChallenge {
  nextStep: typeof ADMIN_AUTH_NEXT_STEP.VERIFY_OTP;
}

export interface LoginApi {
  initializeCsrf(): Promise<void>;
  login(input: LoginInput): Promise<AdminLoginChallenge>;
  verifyOtp(input: LoginOtpInput): Promise<AuthenticatedAdmin>;
}
