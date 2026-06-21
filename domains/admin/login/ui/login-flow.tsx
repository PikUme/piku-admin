"use client";

import { KeyRound, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { AdminApiError } from "@/shared/api/admin-auth/contracts";
import {
  clearAuthenticatedAdmin,
  saveAuthenticatedAdmin,
} from "@/shared/api/admin-auth/session";

import { createLoginApi } from "../api";
import type { LoginApi } from "../api/contracts";
import { initialLoginState, loginReducer } from "../model/reducer";
import {
  type LoginFieldErrors,
  validateLogin,
  validateLoginOtp,
} from "../model/validation";
import { CredentialsLoginStep } from "./credentials-login-step";
import { LoginOtpStep } from "./login-otp-step";
import { LoginProgressLine } from "./login-progress-line";

function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

function apiErrorMessage(error: unknown): string {
  return error instanceof AdminApiError
    ? error.message
    : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

function backendLoginFieldErrors(error: unknown): LoginFieldErrors {
  if (!(error instanceof AdminApiError)) return {};

  return {
    loginId: error.fieldErrors?.loginId,
    password: error.fieldErrors?.password,
  };
}

export function LoginFlow({ api }: { api?: LoginApi }) {
  const router = useRouter();
  const apiClient = useMemo(() => api ?? createLoginApi(), [api]);
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [otpError, setOtpError] = useState<string>();
  const [csrfFailed, setCsrfFailed] = useState(false);
  const initializationStarted = useRef(false);

  async function initializeCsrf() {
    clearAuthenticatedAdmin();
    setCsrfFailed(false);
    dispatch({ type: "requestStarted" });
    try {
      await apiClient.initializeCsrf();
      dispatch({ type: "csrfSucceeded" });
    } catch {
      setCsrfFailed(true);
      dispatch({ type: "requestFailed", error: "보안 연결을 준비하지 못했습니다." });
    }
  }

  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;
    void initializeCsrf();
    // CSRF initialization must happen once for this login API instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiClient]);

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateLogin(state.credentials);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    dispatch({ type: "requestStarted" });
    try {
      const challenge = await apiClient.login(state.credentials);
      dispatch({ type: "loginSucceeded", challenge });
    } catch (error) {
      const errors = backendLoginFieldErrors(error);
      if (hasErrors(errors)) setFieldErrors(errors);
      dispatch({ type: "requestFailed", error: apiErrorMessage(error) });
    }
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateLoginOtp(state.otpCode);
    setOtpError(error);
    if (error) return;

    dispatch({ type: "requestStarted" });
    try {
      const admin = await apiClient.verifyOtp({ otpCode: state.otpCode });
      saveAuthenticatedAdmin(admin);
      router.replace("/admin/dashboard");
    } catch (error) {
      if (error instanceof AdminApiError && error.fieldErrors?.otpCode) {
        setOtpError(error.fieldErrors.otpCode);
      }
      dispatch({ type: "requestFailed", error: apiErrorMessage(error) });
    }
  }

  const pending = state.status === "submitting";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <header className="text-center">
          <div className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-full bg-blue-600 text-white">
            <KeyRound aria-hidden="true" size={27} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            관리자 로그인
          </h1>
        </header>

        <LoginProgressLine step={state.step} />

        {csrfFailed ? (
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
              <CredentialsLoginStep
                value={state.credentials}
                errors={fieldErrors}
                pending={pending || state.status === "initializing"}
                onChange={(field, value) => {
                  setFieldErrors((current) => ({ ...current, [field]: undefined }));
                  dispatch({ type: "credentialChanged", field, value });
                }}
                onSubmit={submitCredentials}
              />
            )}

            {state.step === 2 && state.challenge && (
              <LoginOtpStep
                otpCode={state.otpCode}
                error={otpError}
                pending={pending}
                onChange={(value) => {
                  setOtpError(undefined);
                  dispatch({ type: "otpChanged", value });
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
