import QRCode from "qrcode";

import { AdminApiError } from "@/shared/api/admin-auth/contracts";
import type { AdminAuthRequest } from "@/shared/api/admin-auth/request";

import {
  type CredentialsInput,
  type OnboardingApi,
  type TemporaryLoginInput,
  type VerifyOtpInput,
} from "./contracts";

interface OtpRegistrationResponse {
  issuer: string;
  accountName: string;
  provisioningUri: string;
  manualEntryKey: string;
}

type QrEncoder = (value: string) => Promise<string>;

function parseOtpRegistration(body: unknown): OtpRegistrationResponse {
  if (
    typeof body === "object" &&
    body !== null &&
    "issuer" in body &&
    typeof body.issuer === "string" &&
    "accountName" in body &&
    typeof body.accountName === "string" &&
    "provisioningUri" in body &&
    typeof body.provisioningUri === "string" &&
    "manualEntryKey" in body &&
    typeof body.manualEntryKey === "string"
  ) {
    return {
      issuer: body.issuer,
      accountName: body.accountName,
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
      await request("/api/admin/auth/temporary-login", {
        method: "POST",
        body: input,
      });
    },
    async updateCredentials(input: CredentialsInput) {
      await request("/api/admin/auth/onboarding/credentials", {
        method: "PATCH",
        body: input,
      });
    },
    async startOtpRegistration() {
      const registration = parseOtpRegistration(
        await request("/api/admin/auth/onboarding/otp", { method: "POST" }),
      );

      return {
        issuer: registration.issuer,
        accountName: registration.accountName,
        qrCodeDataUrl: await qrEncoder(registration.provisioningUri),
        manualEntryKey: registration.manualEntryKey,
      };
    },
    async verifyOtp(input: VerifyOtpInput) {
      await request("/api/admin/auth/onboarding/otp/verify", {
        method: "POST",
        body: input,
      });
    },
  };
}
