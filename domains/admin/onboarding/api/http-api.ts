import QRCode from "qrcode";

import {
  ADMIN_AUTH_NEXT_STEP,
  AdminApiError,
} from "@/shared/api/admin-auth/contracts";
import type { AdminAuthRequest } from "@/shared/api/admin-auth/request";
import {
  parseAdminNextStep,
  parseAuthenticatedAdmin,
} from "@/shared/api/admin-auth/response";

import {
  type CredentialsInput,
  type OnboardingApi,
  type TemporaryLoginInput,
  type VerifyOtpInput,
} from "./contracts";

interface OtpRegistrationResponse {
  provisioningUri: string;
  manualEntryKey: string;
}

type QrEncoder = (value: string) => Promise<string>;

function parseOtpRegistration(body: unknown): OtpRegistrationResponse {
  if (
    typeof body === "object" &&
    body !== null &&
    "provisioningUri" in body &&
    typeof body.provisioningUri === "string" &&
    "manualEntryKey" in body &&
    typeof body.manualEntryKey === "string"
  ) {
    return {
      provisioningUri: body.provisioningUri,
      manualEntryKey: body.manualEntryKey,
    };
  }

  throw new AdminApiError("OTP 등록 응답 형식을 확인할 수 없습니다.");
}

async function encodeQrCode(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 210,
  });
}

export function createHttpOnboardingApi(
  request: AdminAuthRequest,
  qrEncoder: QrEncoder = encodeQrCode,
): OnboardingApi {
  return {
    async initializeCsrf() {
      await request("/api/admin/auth/csrf", { method: "POST", csrf: false });
    },
    async temporaryLogin(input: TemporaryLoginInput) {
      parseAdminNextStep(
        await request("/api/admin/auth/temporary-login", {
          method: "POST",
          body: input,
        }),
        ADMIN_AUTH_NEXT_STEP.SET_CREDENTIALS,
      );
    },
    async updateCredentials(input: CredentialsInput) {
      parseAdminNextStep(
        await request("/api/admin/auth/onboarding/credentials", {
          method: "PATCH",
          body: input,
        }),
        ADMIN_AUTH_NEXT_STEP.REGISTER_OTP,
      );
    },
    async startOtpRegistration() {
      const registration = parseOtpRegistration(
        await request("/api/admin/auth/onboarding/otp", { method: "POST" }),
      );

      return {
        qrCodeDataUrl: await qrEncoder(registration.provisioningUri),
        manualEntryKey: registration.manualEntryKey,
      };
    },
    async verifyOtp(input: VerifyOtpInput) {
      return parseAuthenticatedAdmin(
        await request("/api/admin/auth/onboarding/otp/verify", {
          method: "POST",
          body: input,
        }),
      );
    },
  };
}
