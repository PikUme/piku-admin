export function SuccessDonutChart() {
  return (
    <div className="flex h-full flex-col">
      <div className="relative mx-auto mt-10 size-56">
        <svg
          className="size-full -rotate-90"
          viewBox="0 0 120 120"
          role="img"
          aria-label="AI 사진 생성 성공률 92%"
        >
          <circle cx="60" cy="60" r="48" fill="none" stroke="#c91919" strokeWidth="14" pathLength="100" />
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#0864d9"
            strokeWidth="14"
            strokeDasharray="92 8"
            strokeLinecap="butt"
            pathLength="100"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <strong className="text-3xl text-slate-950">92%</strong>
          <span className="mt-1 text-sm text-slate-600">Success Rate</span>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap justify-center gap-5 pt-8 text-sm text-slate-600">
        <span className="flex items-center gap-2"><i className="size-3 rounded-full bg-blue-600" />성공 (12,402)</span>
        <span className="flex items-center gap-2"><i className="size-3 rounded-full bg-red-700" />실패 (1,084)</span>
      </div>
    </div>
  );
}
