"use client";

import { KeyRound, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { createOnboardingApi } from "../api";
import type { OnboardingApi } from "../api/contracts";
import { AdminApiError } from "@/shared/api/admin-auth/contracts";
import { initialOnboardingState, onboardingReducer } from "../model/reducer";
import {
  type FieldErrors,
  validateCredentials,
  validateOtp,
  validateTemporaryLogin,
} from "../model/validation";
import { CredentialsStep } from "./credentials-step";
import { OtpStep } from "./otp-step";
import { ProgressLine } from "./progress-line";
import { TemporaryLoginStep } from "./temporary-login-step";

type TemporaryErrors = FieldErrors<typeof initialOnboardingState.temporaryLogin>;
type CredentialsErrors = FieldErrors<typeof initialOnboardingState.credentials>;

function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

function apiErrorMessage(error: unknown): string {
  return error instanceof AdminApiError
    ? error.message
    : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function OnboardingFlow({ api }: { api?: OnboardingApi }) {
  const router = useRouter();
  const apiClient = useMemo(() => api ?? createOnboardingApi(), [api]);
  const [state, dispatch] = useReducer(onboardingReducer, initialOnboardingState);
  const [temporaryErrors, setTemporaryErrors] = useState<TemporaryErrors>({});
  const [credentialsErrors, setCredentialsErrors] = useState<CredentialsErrors>({});
  const [otpError, setOtpError] = useState<string>();
  const initializationStarted = useRef(false);

  async function initializeCsrf() {
    dispatch({ type: "requestStarted" });
    try {
      await apiClient.initializeCsrf();
      dispatch({ type: "csrfSucceeded" });
    } catch {
      dispatch({ type: "requestFailed", error: "보안 연결을 준비하지 못했습니다." });
    }
  }

  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;
    void initializeCsrf();
    // Initialization belongs to this API instance and must run only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiClient]);

  async function submitTemporaryLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateTemporaryLogin(state.temporaryLogin);
    setTemporaryErrors(errors);
    if (hasErrors(errors)) return;

    dispatch({ type: "requestStarted" });
    try {
      await apiClient.temporaryLogin(state.temporaryLogin);
      dispatch({ type: "temporaryLoginSucceeded" });
    } catch (error) {
      dispatch({ type: "requestFailed", error: apiErrorMessage(error) });
    }
  }

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateCredentials(state.credentials);
    setCredentialsErrors(errors);
    if (hasErrors(errors)) return;

    dispatch({ type: "requestStarted" });
    try {
      await apiClient.updateCredentials({
        loginId: state.credentials.loginId,
        password: state.credentials.password,
      });
      const registration = await apiClient.startOtpRegistration();
      dispatch({ type: "credentialsSucceeded", registration });
    } catch (error) {
      dispatch({ type: "requestFailed", error: apiErrorMessage(error) });
    }
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateOtp(state.otpCode);
    setOtpError(error);
    if (error) return;

    dispatch({ type: "requestStarted" });
    try {
      await apiClient.verifyOtp({ otpCode: state.otpCode });
      router.replace("/admin/dashboard");
    } catch (reason) {
      dispatch({ type: "requestFailed", error: apiErrorMessage(reason) });
    }
  }

  const pending = state.status === "submitting";
  const csrfUnavailable =
    state.status === "failed" && state.step === 1 && !state.temporaryLogin.email;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <section
        className={`w-full rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] ${
          state.step === 3 ? "max-w-5xl p-6 sm:p-10" : "max-w-xl p-6 sm:p-10"
        }`}
      >
        <header className={state.step === 3 ? "text-left" : "text-center"}>
          <div
            className={`mb-5 inline-flex size-14 items-center justify-center rounded-full bg-blue-600 text-white ${
              state.step === 3 ? "" : "mx-auto"
            }`}
          >
            <KeyRound aria-hidden="true" size={27} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            최초 계정 설정
          </h1>
          {state.step === 3 && (
            <p className="mt-2 text-slate-600">보안 강화를 위해 2단계 인증(OTP)을 설정해 주세요.</p>
          )}
        </header>

        <ProgressLine step={state.step} />

        {csrfUnavailable ? (
          <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-800">보안 연결을 준비하지 못했습니다.</p>
            <p className="mt-2 text-sm text-red-700">네트워크 상태를 확인하고 다시 시도해 주세요.</p>
            <button className="secondary-action mx-auto mt-5" type="button" onClick={initializeCsrf}>
              <RotateCcw aria-hidden="true" size={17} />
              다시 시도
            </button>
          </div>
        ) : (
          <>
            {state.error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {state.error}
              </div>
            )}

            {state.step === 1 && (
              <TemporaryLoginStep
                value={state.temporaryLogin}
                errors={temporaryErrors}
                pending={pending || state.status === "initializing"}
                onChange={(field, value) => {
                  setTemporaryErrors((current) => ({ ...current, [field]: undefined }));
                  dispatch({ type: "temporaryFieldChanged", field, value });
                }}
                onSubmit={submitTemporaryLogin}
              />
            )}

            {state.step === 2 && (
              <CredentialsStep
                value={state.credentials}
                errors={credentialsErrors}
                pending={pending}
                onChange={(field, value) => {
                  setCredentialsErrors((current) => ({ ...current, [field]: undefined }));
                  dispatch({ type: "credentialsFieldChanged", field, value });
                }}
                onSubmit={submitCredentials}
              />
            )}

            {state.step === 3 && state.otpRegistration && (
              <OtpStep
                registration={state.otpRegistration}
                code={state.otpCode}
                error={otpError}
                pending={pending}
                onCodeChange={(value) => {
                  setOtpError(undefined);
                  dispatch({ type: "otpCodeChanged", value });
                }}
                onSubmit={submitOtp}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
