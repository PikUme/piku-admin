"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminApiError } from "@/shared/api/admin-auth/contracts";
import { clearAuthenticatedAdmin } from "@/shared/api/admin-auth/session";

import { createDashboardApi, type DashboardData } from "../api";
import type { DashboardMetric } from "../model/dashboard-data";
import { DailyActiveBarChart, WeeklyComparisonChart } from "./bar-chart";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DataTable } from "./data-table";
import { SuccessDonutChart } from "./donut-chart";
import { IssuesPanel } from "./issues-panel";
import { MetricCard } from "./metric-card";

function calculateTrend(current: number, previous: number): string {
  if (previous === 0) {
    if (current === 0) return "0%";
    return "신규";
  }
  const ratio = ((current - previous) / previous) * 100;
  if (ratio === 0) return "0%";
  const formatted = ratio.toFixed(1);
  return ratio > 0 ? `+${formatted}%` : `${formatted}%`;
}

export function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const api = createDashboardApi();
    
    async function fetchData() {
      try {
        setLoading(true);
        const result = await api.getDashboardData();
        setData(result);
        setError(null);
        setErrorStatus(null);
      } catch (err) {
        if (err instanceof AdminApiError) {
          if (
            err.status === 401 ||
            err.problemType === "https://api.pikume.com/problems/security/unauthenticated"
          ) {
            clearAuthenticatedAdmin();
            router.replace("/admin/login");
            return;
          }
          setErrorStatus(err.status || 500);
          setError(err.message || "대시보드 데이터를 가져오지 못했습니다.");
        } else {
          setErrorStatus(500);
          setError("서버 연결에 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [router]);

  const metrics = useMemo<DashboardMetric[]>(() => {
    if (!data) return [];
    return [
      {
        label: "누적 가입 회원",
        value: data.keyMetrics.currentCumulativeMemberCount.toLocaleString(),
        detail: "지난주 대비",
        trend: calculateTrend(
          data.keyMetrics.currentCumulativeMemberCount,
          data.keyMetrics.cumulativeMemberCountSevenDaysAgo,
        ),
        kind: "members",
      },
      {
        label: "월간 활성 사용자 (MAU)",
        value: data.keyMetrics.recent30DayActiveUserCount.toLocaleString(),
        detail: "지난달 대비",
        trend: calculateTrend(
          data.keyMetrics.recent30DayActiveUserCount,
          data.keyMetrics.previous30DayActiveUserCount,
        ),
        kind: "active",
      },
      {
        label: "누적 생성된 AI 사진",
        value: data.keyMetrics.currentAiPhotoSuccessCount.toLocaleString(),
        detail: "지난주 대비",
        trend: calculateTrend(
          data.keyMetrics.currentAiPhotoSuccessCount,
          data.keyMetrics.aiPhotoSuccessCountSevenDaysAgo,
        ),
        kind: "images",
      },
      {
        label: "누적 일기 작성 수",
        value: data.keyMetrics.currentDiaryCreationCount.toLocaleString(),
        detail: "지난주 대비",
        trend: calculateTrend(
          data.keyMetrics.currentDiaryCreationCount,
          data.keyMetrics.diaryCreationCountSevenDaysAgo,
        ),
        kind: "diaries",
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0">
          <DashboardHeader />
          <div className="flex h-[calc(100vh-72px)] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="text-sm font-medium text-slate-500">대시보드 데이터를 불러오는 중입니다...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    let errorTitle = "오류가 발생했습니다";
    let errorDesc = error || "대시보드 데이터를 가져오지 못했습니다.";

    if (errorStatus === 403) {
      errorTitle = "접근 권한 없음";
      errorDesc = "대시보드 조회를 위한 관리자 권한이 부족합니다.";
    } else if (errorStatus === 500) {
      errorTitle = "서버 내부 오류";
      errorDesc = "통계 원천 서버 또는 일시적 서버 오류가 발생했습니다.";
    } else if (errorStatus === 503) {
      errorTitle = "서비스 일시 불가";
      errorDesc = "관리자 세션 저장소를 확인하지 못해 대시보드를 호출할 수 없습니다.";
    }

    return (
      <main className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0">
          <DashboardHeader />
          <div className="flex h-[calc(100vh-72px)] items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-md text-center">
              <h2 className="text-xl font-bold text-red-800">{errorTitle}</h2>
              <p className="mt-2 text-sm text-red-600">{errorDesc}</p>
              {errorStatus !== 500 && errorStatus !== 503 && (
                <button
                  onClick={() => window.location.reload()}
                  className="secondary-action mx-auto mt-6"
                  type="button"
                >
                  다시 시도
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <DashboardSidebar />
      <div className="min-w-0">
        <DashboardHeader />
        <div className="space-y-6 p-4 sm:p-6">
          <section className="dashboard-metrics-grid grid gap-4" aria-label="핵심 지표">
            {metrics.map((metric) => (
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
              <DailyActiveBarChart data={data.dailyActiveUsers} />
            </article>

            <article className="dashboard-panel p-5 sm:p-7">
              <h2 className="dashboard-title">AI 사진 생성 상태</h2>
              <SuccessDonutChart
                successCount={data.aiPhotoGeneration.successCount}
                failureCount={data.aiPhotoGeneration.failureCount}
              />
            </article>
          </section>

          <section className="dashboard-secondary-grid grid gap-6">
            <article className="dashboard-panel p-5 sm:p-7">
              <h2 className="dashboard-title">신규 가입 vs 일기 작성 (주간)</h2>
              <WeeklyComparisonChart data={data.weeklyActivity} />
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
            <DataTable data={data.dailySummary} />
          </section>
        </div>
      </div>
    </main>
  );
}
