"use client";

import { useState } from "react";
import { Calendar, Download } from "lucide-react";

import { DashboardHeader } from "../../dashboard/ui/dashboard-header";
import { DashboardSidebar } from "../../dashboard/ui/dashboard-sidebar";
import {
  STATISTICS_DATA,
  type TabKind,
  type TimeRange,
} from "../model/statistics-data";

import { KPICards } from "./kpi-cards";
import { StatsTable } from "./stats-table";
import { StatisticsTabs } from "./tabs";
import { VisitorChart } from "./visitor-chart";

export function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<TabKind>("visitor");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [searchQuery, setSearchQuery] = useState("");

  const currentData = STATISTICS_DATA[activeTab][timeRange];

  // Map timeRange to human readable calendar string
  const getCalendarText = () => {
    switch (timeRange) {
      case "7d":
        return "2023.10.01 - 2023.10.07";
      case "30d":
        return "2023.09.08 - 2023.10.07";
      case "3m":
        return "2023.07.08 - 2023.10.07";
    }
  };

  // CSV download function with BOM for Excel Korean support
  const handleCSVDownload = () => {
    const escapeCSVCell = (val: string) => {
      const clean = val.replace(/"/g, '""');
      return `"${clean}"`;
    };

    const csvRows = [];
    // Headers
    csvRows.push(currentData.columns.map(escapeCSVCell).join(","));
    // Data rows
    currentData.tableData.forEach((row) => {
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
            <KPICards items={currentData.kpis} />
          </section>

          {/* Main Chart Section */}
          <section className="dashboard-panel p-5 sm:p-7" aria-label="통계 추이 차트">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {currentData.chartTitle}
            </h2>
            <VisitorChart chartData={currentData.chartData} tabKind={activeTab} />
          </section>

          {/* Detailed Searchable Table Section */}
          <section aria-label="상세 일자별 데이터">
            <StatsTable
              columns={currentData.columns}
              tableData={currentData.tableData}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
