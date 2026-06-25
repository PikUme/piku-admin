"use client";

import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DashboardSidebar } from "@/domains/admin/dashboard/ui/dashboard-sidebar";
import { DashboardHeader } from "@/domains/admin/dashboard/ui/dashboard-header";

export function UnauthorizedPage() {
  const utcTimestamp = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <DashboardSidebar activeLabel="" />
      <div className="flex min-w-0 flex-col">
        <DashboardHeader title="" category="" />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-[520px] rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:p-12">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Lock aria-hidden="true" size={28} className="stroke-[1.5]" />
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">403</h2>
            <h3 className="mt-2 text-xl font-bold text-slate-900">접근 권한 없음</h3>
            
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              이 페이지에 접근할 권한이 없습니다.<br />
              필요한 권한이 있다면 시스템 관리자에게 문의하세요.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/admin/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <ArrowLeft size={16} />
                대시보드로 복귀
              </Link>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
              >
                문의하기
              </button>
            </div>

            <hr className="my-8 border-slate-100" />

            <div className="text-left text-xs text-slate-400 font-mono space-y-1">
              <div>Error Reference: ERR-AUTH-403</div>
              <div>Timestamp: {utcTimestamp}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
