import type { LoginStep } from "../model/reducer";

const LABELS: Record<LoginStep, string> = {
  1: "로그인",
  2: "OTP 인증",
};

export function LoginProgressLine({ step }: { step: LoginStep }) {
  return (
    <div className="mt-8" aria-label="로그인 진행 상태">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold">
        <span className="text-blue-700">단계 {step}/2</span>
        <span className="text-slate-600">{LABELS[step]}</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label={`${step}단계 진행 중`}
        aria-valuemin={1}
        aria-valuemax={2}
        aria-valuenow={step}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>
    </div>
  );
}
