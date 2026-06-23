"use client";

import { useState } from "react";
import { Calendar, Download } from "lucide-react";

import { DashboardHeader } from "../../dashboard/ui/dashboard-header";
import { DashboardSidebar } from "../../dashboard/ui/dashboard-sidebar";
import { ACTIVE_USER_DATA } from "../model/active-user-data";
import {
  STATISTICS_DATA,
  type KPICardData,
  type LegacyTabKind,
  type TabKind,
  type TimeRange,
} from "../model/statistics-data";

import { KPICards } from "./kpi-cards";
import { DauLineChart } from "./dau-line-chart";
import { StatsTable } from "./stats-table";
import { StatisticsTabs } from "./tabs";
import { VisitorChart } from "./visitor-chart";

export function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<TabKind>("active");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [searchQuery, setSearchQuery] = useState("");

  const activeUserData = ACTIVE_USER_DATA[timeRange];
  const legacyData =
    activeTab === "active"
      ? null
      : STATISTICS_DATA[activeTab as LegacyTabKind][timeRange];

  const getCalendarText = () => {
    if (activeTab === "active") {
      return `${activeUserData.startDate.replaceAll("-", ".")} - ${activeUserData.endDate.replaceAll("-", ".")}`;
    }

    switch (timeRange) {
      case "7d":
        return "2023.10.01 - 2023.10.07";
      case "30d":
        return "2023.09.08 - 2023.10.07";
      case "3m":
        return "2023.07.08 - 2023.10.07";
    }
  };

  const formatChangeRate = (value: number | null) => {
    if (value === null) return "신규";
    if (value === 0) return "0.0%";
    return `${Math.abs(value).toFixed(1)}%`;
  };

  const formatDate = (value: string | null) =>
    value ? value.replaceAll("-", ".") : "-";

  const activeKpis: KPICardData[] = [
    {
      label: `${timeRange === "7d" ? "7일" : timeRange === "30d" ? "30일" : "3개월"} 활성 회원 수`,
      value: activeUserData.summary.uniqueActiveMemberCount.toLocaleString(),
      description: "선택한 기간에 서비스 API를 한 번 이상 사용한 고유 로그인 회원 수",
      trend: {
        value: formatChangeRate(
          activeUserData.summary.uniqueActiveMemberChangeRate,
        ),
        isPositive:
          (activeUserData.summary.uniqueActiveMemberChangeRate ?? 1) >= 0,
      },
      iconKind: "users",
    },
    {
      label: "평균 DAU",
      value: activeUserData.summary.averageDau.toLocaleString(),
      description: "선택 기간의 일별 DAU 합계를 기간 일수로 나눈 값",
      trend: {
        value: formatChangeRate(activeUserData.summary.averageDauChangeRate),
        isPositive: (activeUserData.summary.averageDauChangeRate ?? 1) >= 0,
      },
      iconKind: "chart",
    },
    {
      label: "최대 DAU",
      value: `${activeUserData.summary.peakDau.toLocaleString()}명 · ${formatDate(
        activeUserData.summary.peakDate,
      )}`,
      description: "선택 기간 중 DAU가 가장 높았던 값과 KST 날짜",
      iconKind: "calendar",
    },
    {
      label: "누적 활성 회원·일",
      value: activeUserData.summary.activeMemberDays.toLocaleString(),
      description: "선택 기간의 일별 DAU 합계. 한 회원이 7일 활동하면 7 회원·일",
      trend: {
        value: formatChangeRate(
          activeUserData.summary.activeMemberDaysChangeRate,
        ),
        isPositive:
          (activeUserData.summary.activeMemberDaysChangeRate ?? 1) >= 0,
      },
      iconKind: "clock",
    },
  ];

  const activeRows = activeUserData.daily
    .filter((point) => {
      const query = searchQuery.trim().replaceAll("-", ".").toLowerCase();
      return (
        query.length === 0 ||
        point.date.replaceAll("-", ".").toLowerCase().includes(query)
      );
    })
    .toReversed();

  // CSV download function with BOM for Excel Korean support
  const handleCSVDownload = () => {
    const escapeCSVCell = (val: string) => {
      const clean = val.replace(/"/g, '""');
      return `"${clean}"`;
    };

    const csvRows: string[] = [];

    if (activeTab === "active") {
      csvRows.push(
        ["날짜", "DAU", "전일 대비", "전일 대비율"]
          .map(escapeCSVCell)
          .join(","),
      );
      activeUserData.daily.toReversed().forEach((point) => {
        csvRows.push(
          [
            point.date,
            point.dau.toLocaleString(),
            `${point.changeCount > 0 ? "+" : ""}${point.changeCount.toLocaleString()}명`,
            point.changeRate === null
              ? "신규"
              : `${point.changeRate > 0 ? "+" : ""}${point.changeRate.toFixed(1)}%`,
          ]
            .map(escapeCSVCell)
            .join(","),
        );
      });

      const csvContent = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `piku_active_users_dau_${timeRange}_${activeUserData.startDate}_${activeUserData.endDate}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    if (!legacyData) return;

    // Headers
    csvRows.push(legacyData.columns.map(escapeCSVCell).join(","));
    // Data rows
    legacyData.tableData.forEach((row) => {
      const rowData = [
        row.date,
        row.col1,
        row.col2,
        row.col3,
        row.col4,
        row.col5,
      ].map(escapeCSVCell);
      csvRows.push(rowData.join(","));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `piku_statistics_${activeTab}_${timeRange}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <DashboardSidebar activeLabel="Statistics" />
      <div className="min-w-0">
        <DashboardHeader title="Statistics" />
        
        <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header Controls Block */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                통계 상세
              </h1>
              <p className="mt-1.5 text-sm font-medium text-slate-500">
                플랫폼의 주요 지표 및 상세 데이터를 분석합니다.
              </p>
            </div>

            {/* Top Right Range Pickers & CSV Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Segmented Button Group */}
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                {(["7d", "30d", "3m"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range);
                      setSearchQuery(""); // Clear search on range change
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      timeRange === range
                        ? "bg-slate-100 text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                    type="button"
                  >
                    {range === "7d" ? "7일" : range === "30d" ? "30일" : "3개월"}
                  </button>
                ))}
              </div>

              {/* Date Box */}
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
                <Calendar size={14} className="text-slate-400" aria-hidden="true" />
                <span>{getCalendarText()}</span>
              </div>

              {/* Download CSV Button */}
              <button
                onClick={handleCSVDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-100"
                type="button"
                aria-label="CSV 파일 다운로드"
              >
                <Download size={14} aria-hidden="true" />
                CSV 다운로드
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <StatisticsTabs activeTab={activeTab} onTabChange={(tab) => {
            setActiveTab(tab);
            setSearchQuery(""); // Clear search on tab change
          }} />

          {/* KPI Metrics Cards */}
          <section aria-label="주요 통계 요약">
            <KPICards items={activeTab === "active" ? activeKpis : legacyData!.kpis} />
          </section>

          {/* Main Chart Section */}
          <section className="dashboard-panel p-5 sm:p-7" aria-label="통계 추이 차트">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {activeTab === "active" ? "DAU 추이" : legacyData!.chartTitle}
            </h2>
            {activeTab === "active" ? (
              <DauLineChart
                points={activeUserData.daily}
                peakDate={activeUserData.summary.peakDate}
              />
            ) : (
              <VisitorChart chartData={legacyData!.chartData} tabKind={activeTab} />
            )}
          </section>

          {/* Detailed Searchable Table Section */}
          <section aria-label="상세 일자별 데이터">
            {activeTab === "active" ? (
              <div className="dashboard-panel overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-bold text-slate-700">
                    날짜별 DAU 상세
                  </h2>
                  <input
                    type="text"
                    placeholder="데이터 검색..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-10 w-full max-w-xs rounded-lg border border-slate-300 px-3 text-sm"
                    aria-label="데이터 검색"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table
                    className="w-full min-w-[680px] text-sm"
                    aria-label="날짜별 DAU 상세 데이터"
                  >
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="px-6 py-3.5 text-left">날짜</th>
                        <th className="px-6 py-3.5 text-right">DAU</th>
                        <th className="px-6 py-3.5 text-right">전일 대비</th>
                        <th className="px-6 py-3.5 text-right">전일 대비율</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-10 text-center text-slate-400"
                          >
                            검색 결과가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        activeRows.map((point) => (
                          <tr key={point.date}>
                            <td className="px-6 py-4">
                              {formatDate(point.date)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {point.dau.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {point.changeCount > 0 ? "+" : ""}
                              {point.changeCount.toLocaleString()}명
                            </td>
                            <td className="px-6 py-4 text-right">
                              {point.changeRate === null
                                ? "신규"
                                : `${point.changeRate > 0 ? "+" : ""}${point.changeRate.toFixed(1)}%`}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <StatsTable
                columns={legacyData!.columns}
                tableData={legacyData!.tableData}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
