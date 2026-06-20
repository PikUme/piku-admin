export interface TemporaryLoginInput {
  email: string;
  temporaryPassword: string;
}

export interface CredentialsInput {
  loginId: string;
  password: string;
}

export interface CredentialsForm extends CredentialsInput {
  confirmation: string;
}

export interface VerifyOtpInput {
  otpCode: string;
}

export interface OtpRegistration {
  issuer: string;
  accountName: string;
  qrCodeDataUrl: string;
  manualEntryKey: string;
}

export interface OnboardingApi {
  initializeCsrf(): Promise<void>;
  temporaryLogin(input: TemporaryLoginInput): Promise<void>;
  updateCredentials(input: CredentialsInput): Promise<void>;
  startOtpRegistration(): Promise<OtpRegistration>;
  verifyOtp(input: VerifyOtpInput): Promise<void>;
}
