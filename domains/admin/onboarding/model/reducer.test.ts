import { describe, expect, it } from "vitest";

import {
  initialOnboardingState,
  onboardingReducer,
} from "./reducer";

describe("onboardingReducer", () => {
  it("becomes ready after CSRF initialization", () => {
    expect(
      onboardingReducer(initialOnboardingState, { type: "csrfSucceeded" }),
    ).toMatchObject({ step: 1, status: "ready", error: null });
  });

  it("updates and preserves form values while moving forward", () => {
    const edited = onboardingReducer(initialOnboardingState, {
      type: "temporaryFieldChanged",
      field: "temporaryId",
      value: "temp.user.123",
    });
    const next = onboardingReducer(edited, { type: "temporaryLoginSucceeded" });

    expect(next).toMatchObject({
      step: 2,
      status: "ready",
      temporaryLogin: { temporaryId: "temp.user.123" },
    });
  });

  it("stores OTP registration data when credentials succeed", () => {
    const registration = {
      qrCodeDataUrl: "data:image/svg+xml,qr",
      manualEntryKey: "JBSWY3DPEHPK3PXP",
    };
    const next = onboardingReducer(initialOnboardingState, {
      type: "credentialsSucceeded",
      registration,
    });

    expect(next).toMatchObject({
      step: 3,
      status: "ready",
      otpRegistration: registration,
    });
  });

  it("tracks pending and retryable errors without changing the step", () => {
    const submitting = onboardingReducer(initialOnboardingState, {
      type: "requestStarted",
    });
    const failed = onboardingReducer(submitting, {
      type: "requestFailed",
      error: "요청을 처리하지 못했습니다.",
    });

    expect(submitting.status).toBe("submitting");
    expect(failed).toMatchObject({
      step: 1,
      status: "failed",
      error: "요청을 처리하지 못했습니다.",
    });
  });

  it("returns to the current ready state when an error is dismissed", () => {
    const failed = onboardingReducer(initialOnboardingState, {
      type: "requestFailed",
      error: "오류",
    });

    expect(
      onboardingReducer(failed, { type: "errorDismissed" }),
    ).toMatchObject({ step: 1, status: "ready", error: null });
  });
});
