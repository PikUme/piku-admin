import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";

import type { LoginInput } from "../api/contracts";
import type { LoginFieldErrors } from "../model/validation";

interface CredentialsLoginStepProps {
  value: LoginInput;
  errors: LoginFieldErrors;
  pending: boolean;
  onChange: (field: keyof LoginInput, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function CredentialsLoginStep({
  value,
  errors,
  pending,
  onChange,
  onSubmit,
}: CredentialsLoginStepProps) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
      <LoginField
        id="login-id"
        label="로그인 ID"
        error={errors.loginId}
        icon={<UserRound aria-hidden="true" size={20} />}
      >
        <input
          id="login-id"
          className="onboarding-input pl-11"
          value={value.loginId}
          placeholder="로그인 ID 입력"
          autoComplete="username"
          disabled={pending}
          onChange={(event) => onChange("loginId", event.target.value)}
          aria-invalid={Boolean(errors.loginId)}
          aria-describedby={errors.loginId ? "login-id-error" : undefined}
        />
      </LoginField>

      <LoginField
        id="login-password"
        label="비밀번호"
        error={errors.password}
        icon={<LockKeyhole aria-hidden="true" size={20} />}
      >
        <input
          id="login-password"
          type="password"
          className="onboarding-input pl-11"
          value={value.password}
          placeholder="비밀번호 입력"
          autoComplete="current-password"
          disabled={pending}
          onChange={(event) => onChange("password", event.target.value)}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "login-password-error" : undefined}
        />
      </LoginField>

      <button className="primary-action w-full" type="submit" disabled={pending}>
        {pending ? "로그인 중..." : "로그인"}
        {!pending && <ArrowRight aria-hidden="true" size={19} />}
      </button>

      <Link
        className="block text-center text-sm font-medium text-slate-500 transition-colors hover:text-blue-700"
        href="/admin/onboarding"
      >
        임시 계정을 발급받으셨나요?
      </Link>
    </form>
  );
}

function LoginField({
  id,
  label,
  error,
  icon,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
