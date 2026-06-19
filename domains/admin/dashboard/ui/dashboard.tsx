import { ChevronDown } from "lucide-react";

import { dashboardMetrics } from "../model/dashboard-data";
import { DailyActiveBarChart, WeeklyComparisonChart } from "./bar-chart";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DataTable } from "./data-table";
import { SuccessDonutChart } from "./donut-chart";
import { IssuesPanel } from "./issues-panel";
import { MetricCard } from "./metric-card";

export function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <DashboardSidebar />
      <div className="min-w-0">
        <DashboardHeader />
        <div className="space-y-6 p-4 sm:p-6">
          <section className="dashboard-metrics-grid grid gap-4" aria-label="핵심 지표">
            {dashboardMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </section>

          <section className="dashboard-primary-grid grid gap-6">
            <article className="dashboard-panel p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="dashboard-title">일간 활성 사용자 (DAU) 추이</h2>
                <button className="secondary-action text-xs" type="button">
                  최근 7일
                  <ChevronDown aria-hidden="true" size={15} />
                </button>
              </div>
              <DailyActiveBarChart />
            </article>

            <article className="dashboard-panel p-5 sm:p-7">
              <h2 className="dashboard-title">AI 사진 생성 상태</h2>
              <SuccessDonutChart />
            </article>
          </section>

          <section className="dashboard-secondary-grid grid gap-6">
            <article className="dashboard-panel p-5 sm:p-7">
              <h2 className="dashboard-title">신규 가입 vs 일기 작성 (주간)</h2>
              <WeeklyComparisonChart />
            </article>

            <article className="dashboard-panel overflow-hidden">
              <div className="flex items-center justify-between px-5 py-5 sm:px-7">
                <h2 className="dashboard-title">최근 이슈 및 알림</h2>
                <button className="text-sm font-semibold text-blue-700" type="button">전체보기</button>
              </div>
              <IssuesPanel />
            </article>
          </section>

          <section className="dashboard-panel overflow-hidden">
            <h2 className="px-5 py-5 text-sm font-semibold text-slate-700">날짜별 데이터 요약</h2>
            <DataTable />
          </section>
        </div>
      </div>
    </main>
  );
}
