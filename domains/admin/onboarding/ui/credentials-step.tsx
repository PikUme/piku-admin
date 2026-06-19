import { ArrowRight, CheckCircle2, Info } from "lucide-react";
import type { FormEvent } from "react";

import type { CredentialsForm } from "../api/contracts";
import type { FieldErrors } from "../model/validation";

interface CredentialsStepProps {
  value: CredentialsForm;
  errors: FieldErrors<CredentialsForm>;
  pending: boolean;
  onChange: (field: keyof CredentialsForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function CredentialsStep({
  value,
  errors,
  pending,
  onChange,
  onSubmit,
}: CredentialsStepProps) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
      <TextField
        id="login-id"
        label="로그인 ID"
        value={value.loginId}
        placeholder="아이디 입력"
        error={errors.loginId}
        autoComplete="username"
        disabled={pending}
        onChange={(next) => onChange("loginId", next)}
      />
      <p className="-mt-4 flex gap-2 text-sm leading-6 text-slate-500">
        <Info className="mt-1 shrink-0" aria-hidden="true" size={16} />
        4~15자 이하, 영문 소문자, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.
      </p>

      <TextField
        id="password"
        label="비밀번호"
        type="password"
        value={value.password}
        placeholder="비밀번호 입력"
        error={errors.password}
        autoComplete="new-password"
        disabled={pending}
        onChange={(next) => onChange("password", next)}
      />

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="mb-2 font-semibold text-slate-700">비밀번호 설정 규칙</p>
        <Rule>8자 이상 20자 이하</Rule>
        <Rule>영문 대문자, 소문자, 숫자, 특수문자 각각 1개 이상 포함</Rule>
        <Rule>아이디와 동일한 문자열 사용 불가</Rule>
      </div>

      <TextField
        id="password-confirmation"
        label="비밀번호 확인"
        type="password"
        value={value.confirmation}
        placeholder="비밀번호 재입력"
        error={errors.confirmation}
        autoComplete="new-password"
        disabled={pending}
        onChange={(next) => onChange("confirmation", next)}
      />

      <button className="primary-action ml-auto" type="submit" disabled={pending}>
        {pending ? "OTP 준비 중..." : "다음 단계"}
        {!pending && <ArrowRight aria-hidden="true" size={19} />}
      </button>
    </form>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 shrink-0 text-slate-500" size={15} />
      <span>{children}</span>
    </p>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  type?: "text" | "password";
  autoComplete: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function TextField({
  id,
  label,
  value,
  placeholder,
  error,
  type = "text",
  autoComplete,
  disabled,
  onChange,
}: TextFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        className="onboarding-input"
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
