import {
  OnboardingApiError,
  type CredentialsInput,
  type OnboardingApi,
  type OtpRegistration,
  type TemporaryLoginInput,
  type VerifyOtpInput,
} from "./contracts";

type Fetcher = typeof fetch;

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function messageFromBody(body: unknown): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }

  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

function parseOtpRegistration(body: unknown): OtpRegistration {
  if (
    typeof body === "object" &&
    body !== null &&
    "qrCodeDataUrl" in body &&
    typeof body.qrCodeDataUrl === "string" &&
    "manualEntryKey" in body &&
    typeof body.manualEntryKey === "string"
  ) {
    return {
      qrCodeDataUrl: body.qrCodeDataUrl,
      manualEntryKey: body.manualEntryKey,
    };
  }

  throw new OnboardingApiError("OTP 등록 응답 형식을 확인할 수 없습니다.");
}

export function createHttpOnboardingApi(
  baseUrl: string,
  fetcher: Fetcher = fetch,
): OnboardingApi {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  async function request(
    path: string,
    method: "POST" | "PATCH",
    body?: object,
  ): Promise<unknown> {
    const response = await fetcher(`${normalizedBaseUrl}${path}`, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const responseBody = await readBody(response);

    if (!response.ok) {
      throw new OnboardingApiError(
        messageFromBody(responseBody),
        response.status,
      );
    }

    return responseBody;
  }

  return {
    async initializeCsrf() {
      await request("/api/admin/auth/csrf", "POST");
    },
    async temporaryLogin(input: TemporaryLoginInput) {
      await request("/api/admin/auth/temporary-login", "POST", input);
    },
    async updateCredentials(input: CredentialsInput) {
      await request("/api/admin/auth/onboarding/credentials", "PATCH", input);
    },
    async startOtpRegistration() {
      return parseOtpRegistration(
        await request("/api/admin/auth/onboarding/otp", "POST"),
      );
    },
    async verifyOtp(input: VerifyOtpInput) {
      await request("/api/admin/auth/onboarding/otp/verify", "POST", input);
    },
  };
}
