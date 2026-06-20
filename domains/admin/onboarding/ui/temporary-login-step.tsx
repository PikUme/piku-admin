import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import type { FormEvent } from "react";

import type { TemporaryLoginInput } from "../api/contracts";
import type { FieldErrors } from "../model/validation";

interface TemporaryLoginStepProps {
  value: TemporaryLoginInput;
  errors: FieldErrors<TemporaryLoginInput>;
  pending: boolean;
  onChange: (field: keyof TemporaryLoginInput, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function TemporaryLoginStep({
  value,
  errors,
  pending,
  onChange,
  onSubmit,
}: TemporaryLoginStepProps) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
      <Field
        id="temporary-email"
        label="이메일"
        icon={<Mail aria-hidden="true" size={20} />}
        error={errors.email}
      >
        <input
          id="temporary-email"
          type="email"
          value={value.email}
          onChange={(event) => onChange("email", event.target.value)}
          className="onboarding-input pl-11"
          placeholder="admin@example.com"
          autoComplete="email"
          disabled={pending}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "temporary-email-error" : undefined}
        />
      </Field>

      <Field
        id="temporary-password"
        label="임시 비밀번호"
        icon={<LockKeyhole aria-hidden="true" size={20} />}
        error={errors.temporaryPassword}
      >
        <input
          id="temporary-password"
          type="password"
          value={value.temporaryPassword}
          onChange={(event) => onChange("temporaryPassword", event.target.value)}
          className="onboarding-input pl-11"
          placeholder="임시 비밀번호 입력"
          autoComplete="current-password"
          disabled={pending}
          aria-invalid={Boolean(errors.temporaryPassword)}
          aria-describedby={
            errors.temporaryPassword ? "temporary-password-error" : undefined
          }
        />
      </Field>

      <button className="primary-action w-full" type="submit" disabled={pending}>
        {pending ? "확인 중..." : "다음"}
        {!pending && <ArrowRight aria-hidden="true" size={19} />}
      </button>

      <p className="text-center text-sm text-slate-500">
        이메일을 받지 못하셨나요?
      </p>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, icon, error, children }: FieldProps) {
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
