"use client";

import { useEffect, useState } from "react";
import {
  Info,
  Settings,
  History,
  Key,
  Shield,
  Smartphone,
  Ban,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedAdmin } from "@/shared/api/admin-auth/use-authenticated-admin";
import { DashboardSidebar } from "@/domains/admin/dashboard/ui/dashboard-sidebar";
import { DashboardHeader } from "@/domains/admin/dashboard/ui/dashboard-header";
import { MOCK_ADMINS, MOCK_AUDIT_LOGS } from "../model/admin-data";
import { UnauthorizedPage } from "./unauthorized";

interface Props {
  id: string;
}

export function ManagementDetail({ id }: Props) {
  const admin = useAuthenticatedAdmin();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // Find targeted admin account
  const targetAdmin = MOCK_ADMINS.find((item) => item.id === id) || MOCK_ADMINS[3]; // default to admin_1024
  const auditLogs = MOCK_AUDIT_LOGS[targetAdmin.id] || [];

  // Mock states for interactive actions
  const [currentRoleLevel, setCurrentRoleLevel] = useState(targetAdmin.roleLevel);
  const [currentStatus, setCurrentStatus] = useState(targetAdmin.status);
  const [otpEnabled, setOtpEnabled] = useState(targetAdmin.otpEnabled);
  const [modalType, setModalType] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar activeLabel="Admin Management" />
        <div className="min-w-0">
          <DashboardHeader title="Admin Details" category="Admin Management" />
          <div className="flex h-[calc(100vh-72px)] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="text-sm font-medium text-slate-500">권한을 확인하는 중입니다...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!admin) {
    if (typeof window !== "undefined") {
      router.replace("/admin/login");
    }
    return null;
  }

  if (admin.role !== "SUPER_ADMIN") {
    return <UnauthorizedPage />;
  }

  const triggerAction = (action: string) => {
    setModalType(action);
  };

  const handleConfirmAction = () => {
    if (modalType === "change-role") {
      setCurrentRoleLevel(
        currentRoleLevel.includes("5")
          ? "Manager (Level 3)"
          : "Super Admin (Level 5)"
      );
    } else if (modalType === "reset-otp") {
      setOtpEnabled(false);
    } else if (modalType === "deactivate") {
      setCurrentStatus(currentStatus === "ACTIVE" ? "LOCKED" : "ACTIVE");
    }
    setModalType(null);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <DashboardSidebar activeLabel="Admin Management" />
      <div className="min-w-0">
        <DashboardHeader title="Admin Details" category="Admin Management" />

        <div className="p-6 lg:p-8">
          {/* Top navigation row */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/admin/management"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="inline-flex size-7 items-center justify-center rounded bg-blue-100 text-blue-700">
                <Shield size={16} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                관리자 상세 정보
              </h2>
            </div>
          </div>

          <div className="mb-6">
            <span
              className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold border ${
                currentStatus === "ACTIVE"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-amber-100 text-amber-800 border-amber-200"
              }`}
            >
              {currentStatus === "ACTIVE" ? "활성" : "잠금"}
            </span>
          </div>

          {/* Form and Actions Row */}
          <div className="mb-6 grid gap-6 md:grid-cols-[2fr_1fr]">
            {/* Left Card: Basic Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h3 className="mb-6 flex items-center gap-2.5 text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-4">
                <Info size={18} className="text-slate-400" />
                기본 정보
              </h3>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">이름</label>
                  <input
                    type="text"
                    value={targetAdmin.name}
                    readOnly
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">아이디 (사번)</label>
                  <input
                    type="text"
                    value={targetAdmin.id}
                    readOnly
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">소속 부서</label>
                  <input
                    type="text"
                    value={targetAdmin.department}
                    readOnly
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">현재 권한 등급</label>
                  <div className="flex gap-2">
                    <div className="flex h-10 flex-1 items-center rounded-lg border border-blue-100 bg-blue-50/80 px-3 text-xs font-bold text-blue-700">
                      {currentRoleLevel}
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerAction("change-role")}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      등급 변경
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">최근 로그인</label>
                  <input
                    type="text"
                    value={targetAdmin.lastLogin}
                    readOnly
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Card: Security & Management Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h3 className="mb-6 flex items-center gap-2.5 text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-4">
                <Settings size={18} className="text-slate-400" />
                보안 및 관리 액션
              </h3>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => triggerAction("temp-pwd")}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <Key size={18} className="text-slate-400" />
                    임시 비밀번호 발급
                  </span>
                  <ArrowRight size={16} className="text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => triggerAction("reset-otp")}
                  disabled={!otpEnabled}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <span className="flex items-center gap-3">
                    <Smartphone size={18} className="text-slate-400" />
                    OTP 인증 초기화
                  </span>
                  <ArrowRight size={16} className="text-slate-400" />
                </button>

                <hr className="border-slate-100 my-4" />

                <button
                  type="button"
                  onClick={() => triggerAction("deactivate")}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
                >
                  <Ban size={16} />
                  {currentStatus === "ACTIVE" ? "계정 비활성화" : "계정 활성화"}
                </button>

                <p className="text-[11px] leading-relaxed text-slate-400 text-center">
                  비활성화 시 해당 관리자의 모든 시스템 접근이 차단됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Audit Logs Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="flex items-center gap-2.5 text-[15px] font-bold text-slate-900">
                <History size={18} className="text-slate-400" />
                최근 감사 로그 (Audit Log)
              </h3>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                전체 보기
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-900">
                <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3">일시 (KST)</th>
                    <th scope="col" className="px-6 py-3">액션 유형</th>
                    <th scope="col" className="px-6 py-3">상세 내용</th>
                    <th scope="col" className="px-6 py-3">IP 주소</th>
                    <th scope="col" className="px-6 py-3">결과</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 text-slate-500">{log.timestamp}</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-700">{log.details}</td>
                      <td className="px-6 py-3.5 text-slate-500">{log.ipAddress}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`font-semibold ${
                            log.result === "SUCCESS" ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {log.result === "SUCCESS" ? "성공" : "실패"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        기록된 로그가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-150">
            <h4 className="text-base font-bold text-slate-900">
              {modalType === "change-role"
                ? "관리자 등급 변경"
                : modalType === "temp-pwd"
                ? "임시 비밀번호 발급"
                : modalType === "reset-otp"
                ? "OTP 인증 초기화"
                : "계정 상태 변경"}
            </h4>
            <p className="mt-2 text-sm text-slate-500">
              {modalType === "change-role"
                ? "해당 관리자의 권한 등급을 토글하시겠습니까?"
                : modalType === "temp-pwd"
                ? "해당 계정에 임시 비밀번호를 발급하시겠습니까?"
                : modalType === "reset-otp"
                ? "해당 관리자의 OTP 인증 정보를 초기화하시겠습니까?"
                : `해당 관리자 계정을 ${currentStatus === "ACTIVE" ? "비활성화" : "활성화"} 처리하시겠습니까?`}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
