import { describe, expect, it } from "vitest";

import { ADMIN_AUTH_NEXT_STEP } from "@/shared/api/admin-auth/contracts";

import { initialLoginState, loginReducer } from "./reducer";

const challenge = {
  nextStep: ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
};

describe("loginReducer", () => {
  it("becomes ready after CSRF initialization", () => {
    expect(loginReducer(initialLoginState, { type: "csrfSucceeded" })).toMatchObject({
      step: 1,
      status: "ready",
      error: null,
    });
  });

  it("preserves credentials and advances only after login succeeds", () => {
    const edited = loginReducer(initialLoginState, {
      type: "credentialChanged",
      field: "loginId",
      value: "admin_1",
    });
    const next = loginReducer(edited, { type: "loginSucceeded", challenge });

    expect(next).toMatchObject({
      step: 2,
      status: "ready",
      credentials: { loginId: "admin_1" },
      challenge,
    });
  });

  it("tracks OTP edits", () => {
    expect(
      loginReducer(initialLoginState, { type: "otpChanged", value: "123456" }),
    ).toMatchObject({ otpCode: "123456" });
  });

  it("retains the current step when requests fail", () => {
    const stepTwo = loginReducer(initialLoginState, {
      type: "loginSucceeded",
      challenge,
    });
    const failed = loginReducer(stepTwo, {
      type: "requestFailed",
      error: "OTP가 올바르지 않습니다.",
    });

    expect(failed).toMatchObject({
      step: 2,
      status: "failed",
      error: "OTP가 올바르지 않습니다.",
    });
  });
});
