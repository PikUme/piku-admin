import type { DailySummaryPoint } from "../api/contracts";

const getKstTodayDate = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const day = parts.find((p) => p.type === "day")?.value || "";
  return `${year}-${month}-${day}`;
};

export function DataTable({ data = [] }: { data?: DailySummaryPoint[] }) {
  const todayStr = getKstTodayDate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm" aria-label="날짜별 데이터 요약">
        <thead className="border-y border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-5 py-4">Date</th>
            <th className="px-5 py-4 text-right">New Users</th>
            <th className="px-5 py-4 text-right">Active Users (DAU)</th>
            <th className="px-5 py-4 text-right">Diaries Created</th>
            <th className="px-5 py-4 text-right">AI Gen Requests</th>
            <th className="px-5 py-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((row) => {
            const isToday = row.date === todayStr;
            const status = isToday ? "Processing" : "Closed";

            return (
              <tr className="text-slate-700 hover:bg-slate-50" key={row.date}>
                <td className="px-5 py-4 font-medium">{row.date}</td>
                <td className="px-5 py-4 text-right">{row.newMemberCount.toLocaleString()}</td>
                <td className="px-5 py-4 text-right">{row.dau.toLocaleString()}</td>
                <td className="px-5 py-4 text-right">{row.diaryCreationCount.toLocaleString()}</td>
                <td className="px-5 py-4 text-right">{row.aiPhotoRequestCount.toLocaleString()}</td>
                <td className="px-5 py-4 text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isToday
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
