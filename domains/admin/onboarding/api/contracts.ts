export interface TemporaryLoginInput {
  temporaryId: string;
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
  code: string;
}

export interface OtpRegistration {
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

export class OnboardingApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "OnboardingApiError";
  }
}
