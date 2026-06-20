import { ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";

interface LoginOtpStepProps {
  nickname: string;
  otpCode: string;
  error?: string;
  pending: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function LoginOtpStep({
  nickname,
  otpCode,
  error,
  pending,
  onChange,
  onSubmit,
}: LoginOtpStepProps) {
  return (
    <form className="mt-8" onSubmit={onSubmit} noValidate>
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
        <p className="font-semibold text-blue-900">
          {nickname}님, OTP 코드를 입력해 주세요.
        </p>
        <p className="mt-1 text-sm leading-6 text-blue-700">
          등록된 인증 앱에 표시된 6자리 숫자를 입력하면 로그인이 완료됩니다.
        </p>
      </div>

      <label className="mt-7 block text-sm font-semibold text-slate-700" htmlFor="login-otp-code">
        인증 코드 (6자리)
      </label>
      <input
        id="login-otp-code"
        className="onboarding-input mt-2 text-center font-mono text-2xl tracking-[0.45em]"
        value={otpCode}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        disabled={pending}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, 6))
        }
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "login-otp-error" : undefined}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600" id="login-otp-error" role="alert">
          {error}
        </p>
      )}

      <button className="primary-action mt-7 w-full" type="submit" disabled={pending}>
        <ShieldCheck aria-hidden="true" size={19} />
        {pending ? "인증 중..." : "OTP 인증"}
      </button>
    </form>
  );
}
