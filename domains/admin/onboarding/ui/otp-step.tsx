import Image from "next/image";
import { Check, Copy } from "lucide-react";
import type { FormEvent } from "react";

import type { OtpRegistration } from "../api/contracts";

interface OtpStepProps {
  registration: OtpRegistration;
  code: string;
  error?: string;
  pending: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function OtpStep({
  registration,
  code,
  error,
  pending,
  onCodeChange,
  onSubmit,
}: OtpStepProps) {
  return (
    <form className="mt-8" onSubmit={onSubmit} noValidate>
      <div className="grid gap-8 lg:grid-cols-[390px_1fr] lg:items-center">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <h2 className="font-semibold text-slate-800">인증 앱 설정</h2>
          <div className="mx-auto mt-5 w-fit rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <Image
              src={registration.qrCodeDataUrl}
              alt="OTP 등록 QR 코드"
              width={210}
              height={210}
              unoptimized
            />
          </div>
          <p className="mt-5 leading-6 text-slate-600">
            Google Authenticator 등의 인증 앱으로 QR 코드를 스캔하세요.
          </p>
          <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-slate-300" />
            또는 수동 입력
            <span className="h-px flex-1 bg-slate-300" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-200/70 px-4 py-3 font-mono tracking-[0.14em] text-slate-800">
            <span>{registration.manualEntryKey}</span>
            <Copy aria-hidden="true" className="text-blue-600" size={18} />
          </div>
        </section>

        <section className="py-2">
          <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            마지막 단계
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            인증 코드 입력
          </h2>
          <p className="mt-3 max-w-md leading-7 text-slate-600">
            앱에 표시된 6자리 숫자를 입력하여 계정 보안 설정을 완료하세요.
          </p>
          <label className="mt-7 block text-sm font-semibold text-slate-700" htmlFor="otp-code">
            인증 코드 (6자리)
          </label>
          <input
            id="otp-code"
            className="onboarding-input mt-2 text-center font-mono text-2xl tracking-[0.45em]"
            value={code}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            disabled={pending}
            onChange={(event) =>
              onCodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "otp-code-error" : undefined}
          />
          {error && (
            <p className="mt-1.5 text-sm text-red-600" id="otp-code-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-action mt-7 w-full" type="submit" disabled={pending}>
            <Check aria-hidden="true" size={19} />
            {pending ? "인증 중..." : "인증 완료"}
          </button>
        </section>
      </div>
    </form>
  );
}
