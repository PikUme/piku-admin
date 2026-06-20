export type AdminRole = "SUPER_ADMIN" | "OPERATOR" | "VIEWER";

export interface AdminProfile {
  loginId: string;
  nickname: string;
  email: string;
  role: AdminRole;
}

export interface LoginInput {
  loginId: string;
  password: string;
}

export interface LoginOtpInput {
  otpCode: string;
}

export interface AdminLoginChallenge extends AdminProfile {
  nextStep: "VERIFY_OTP";
}

export interface AdminAuthentication {
  authenticated: true;
  admin: AdminProfile;
}

export interface LoginApi {
  initializeCsrf(): Promise<void>;
  login(input: LoginInput): Promise<AdminLoginChallenge>;
  verifyOtp(input: LoginOtpInput): Promise<AdminAuthentication>;
}
