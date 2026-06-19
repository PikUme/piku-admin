import { dailyActiveUsers, weeklyActivity } from "../model/dashboard-data";

export function DailyActiveBarChart() {
  const max = 15000;

  return (
    <svg
      className="mt-5 h-[290px] w-full overflow-visible"
      viewBox="0 0 720 300"
      role="img"
      aria-label="최근 7일 일간 활성 사용자 막대 차트"
    >
      {[0, 5000, 10000, 15000].map((tick) => {
        const y = 250 - (tick / max) * 220;
        return (
          <g key={tick}>
            <line x1="48" x2="700" y1={y} y2={y} stroke="#e7eaf0" strokeWidth="1" />
            <text x="38" y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {tick === 0 ? "0" : `${tick / 1000}k`}
            </text>
          </g>
        );
      })}
      <line x1="48" x2="700" y1="250" y2="250" stroke="#cbd5e1" />
      {dailyActiveUsers.map((item, index) => {
        const x = 76 + index * 88;
        const height = (item.value / max) * 220;
        return (
          <g key={item.label}>
            <rect x={x} y={250 - height} width="22" height={height} rx="4" fill="#0864d9" />
            <text x={x + 11} y="274" textAnchor="middle" fontSize="12" fill="#475569">
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function WeeklyComparisonChart() {
  const max = 1000;

  return (
    <div>
      <svg
        className="mt-5 h-[245px] w-full"
        viewBox="0 0 520 250"
        role="img"
        aria-label="주간 신규 가입 및 일기 작성 비교 막대 차트"
      >
        <line x1="40" x2="500" y1="210" y2="210" stroke="#cbd5e1" />
        {weeklyActivity.map((item, index) => {
          const x = 78 + index * 105;
          const usersHeight = (item.newUsers / max) * 175;
          const diariesHeight = (item.diaries / max) * 175;
          return (
            <g key={item.label}>
              <rect x={x} y={210 - usersHeight} width="25" height={usersHeight} rx="3" fill="#2878df" />
              <rect x={x + 29} y={210 - diariesHeight} width="25" height={diariesHeight} rx="3" fill="#b4c9e4" />
              <text x={x + 27} y="232" textAnchor="middle" fontSize="11" fill="#64748b">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-center gap-6 text-xs text-slate-600">
        <Legend color="#2878df">신규 가입</Legend>
        <Legend color="#b4c9e4">일기 작성</Legend>
      </div>
    </div>
  );
}

function Legend({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}
