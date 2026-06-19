import type { OnboardingStep } from "../model/reducer";

const STEP_LABELS: Record<OnboardingStep, string> = {
  1: "임시 로그인",
  2: "계정 생성",
  3: "OTP 등록",
};

export function ProgressLine({ step }: { step: OnboardingStep }) {
  return (
    <div className="mt-8" aria-label="온보딩 진행 상태">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold">
        <span className="text-blue-700">단계 {step}/3</span>
        <span className="text-slate-600">{STEP_LABELS[step]}</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label={`${step}단계 진행 중`}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={step}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  );
}
