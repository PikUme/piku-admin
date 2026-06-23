"use client";

import { Search } from "lucide-react";

import type { ActiveUserDailyPoint } from "../model/active-user-data";

interface DauTableProps {
  points: ActiveUserDailyPoint[];
  peakDate: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function formatDate(date: string): string {
  return date.replaceAll("-", ".");
}

function normalizeDateQuery(value: string): string {
  return value.trim().replaceAll("-", ".").toLowerCase();
}

function formatSignedCount(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toLocaleString()}명`;
}

function formatSignedRate(value: number | null): string {
  if (value === null) return "신규";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function DauTable({
  points,
  peakDate,
  searchQuery,
  onSearchChange,
}: DauTableProps) {
  const query = normalizeDateQuery(searchQuery);
  const rows = [...points]
    .reverse()
    .filter(
      (point) =>
        query.length === 0 ||
        formatDate(point.date).toLowerCase().includes(query),
    );

  return (
    <div className="dashboard-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-bold text-slate-700">날짜별 DAU 상세</h2>

        <label className="relative w-full max-w-xs">
          <span className="sr-only">DAU 날짜 검색</span>
          <Search
            size={16}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="데이터 검색..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table
          className="w-full min-w-[680px] text-left text-sm"
          aria-label="날짜별 DAU 상세 데이터"
        >
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3.5 text-left">날짜</th>
              <th className="px-6 py-3.5 text-right">DAU</th>
              <th className="px-6 py-3.5 text-right">전일 대비</th>
              <th className="px-6 py-3.5 text-right">전일 대비율</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center font-medium text-slate-400"
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((point) => {
                const isPeak = point.date === peakDate;
                const changeTone =
                  point.changeCount > 0
                    ? "text-emerald-600"
                    : point.changeCount < 0
                      ? "text-rose-600"
                      : "text-slate-500";

                return (
                  <tr
                    key={point.date}
                    className={`transition-colors hover:bg-slate-50/70 ${
                      isPeak ? "bg-orange-50/50" : ""
                    }`}
                  >
                    <td
                      className={`px-6 py-4 font-medium ${
                        isPeak ? "text-orange-700" : "text-slate-900"
                      }`}
                    >
                      <span>{formatDate(point.date)}</span>
                      {isPeak && (
                        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                          최대
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {point.dau.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${changeTone}`}>
                      {formatSignedCount(point.changeCount)}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${changeTone}`}>
                      {formatSignedRate(point.changeRate)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
