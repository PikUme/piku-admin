"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Calendar, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedAdmin } from "@/shared/api/admin-auth/use-authenticated-admin";
import { DashboardSidebar } from "@/domains/admin/dashboard/ui/dashboard-sidebar";
import { DashboardHeader } from "@/domains/admin/dashboard/ui/dashboard-header";
import { MOCK_ADMINS, type AdminAccount } from "../model/admin-data";
import { UnauthorizedPage } from "./unauthorized";

export function ManagementList() {
  const admin = useAuthenticatedAdmin();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // Filter Form States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedOtp, setSelectedOtp] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filtered List State
  const [filteredAdmins, setFilteredAdmins] = useState<AdminAccount[]>(MOCK_ADMINS);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
          <DashboardHeader title="관리자 목록" category="Admin Management" />
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

  const handleSearch = () => {
    const filtered = MOCK_ADMINS.filter((item) => {
      // 1. Search Query (id, nickname, email)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          item.id.toLowerCase().includes(query) ||
          item.nickname.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Role Filter
      if (selectedRole !== "ALL") {
        if (selectedRole === "SUPER_ADMIN" && item.role !== "Super Admin") return false;
        if (selectedRole === "MANAGER" && item.role !== "Manager") return false;
        if (selectedRole === "VIEWER" && item.role !== "Viewer") return false;
      }

      // 3. Status Filter
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "ACTIVE" && item.status !== "ACTIVE") return false;
        if (selectedStatus === "LOCKED" && item.status !== "LOCKED") return false;
      }

      // 4. OTP Filter
      if (selectedOtp !== "ALL") {
        const otpVal = selectedOtp === "Y";
        if (item.otpEnabled !== otpVal) return false;
      }

      // 5. Date Range Filter
      if (startDate) {
        if (item.createdDate < startDate) return false;
      }
      if (endDate) {
        if (item.createdDate > endDate) return false;
      }

      return true;
    });

    setFilteredAdmins(filtered);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedRole("ALL");
    setSelectedStatus("ALL");
    setSelectedOtp("ALL");
    setStartDate("");
    setEndDate("");
    setFilteredAdmins(MOCK_ADMINS);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalItems = filteredAdmins.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <DashboardSidebar activeLabel="Admin Management" />
      <div className="min-w-0">
        <DashboardHeader title="관리자 목록" category="Admin Management" />

        <div className="p-6 lg:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">관리자 목록</h2>
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[14px] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <Plus size={18} />
              신규 관리자 등록
            </button>
          </div>

          {/* Filter Container */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">검색</label>
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="로그인 아이디, 닉네임, 이메일 검색"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">등급</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">전체 등급</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">상태</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">전체 상태</option>
                  <option value="ACTIVE">활성</option>
                  <option value="LOCKED">잠금</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">OTP 설정</label>
                <select
                  value={selectedOtp}
                  onChange={(e) => setSelectedOtp(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">전체</option>
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">생성일</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-slate-400">~</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-end gap-2 sm:col-span-2 md:col-span-1 lg:col-span-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none"
                >
                  <RotateCcw size={15} />
                  초기화
                </button>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none"
                >
                  검색
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-900">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">로그인 아이디</th>
                    <th scope="col" className="px-6 py-4">닉네임</th>
                    <th scope="col" className="px-6 py-4">이메일</th>
                    <th scope="col" className="px-6 py-4">등급</th>
                    <th scope="col" className="px-6 py-4">상태</th>
                    <th scope="col" className="px-6 py-4 text-center">OTP</th>
                    <th scope="col" className="px-6 py-4">최종 로그인</th>
                    <th scope="col" className="px-6 py-4">생성일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/admin/management/${item.id}`)}
                      className="cursor-pointer transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4 font-semibold text-blue-600 hover:underline">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{item.nickname}</td>
                      <td className="px-6 py-4 text-slate-500">{item.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${item.role === "Super Admin"
                              ? "bg-purple-50 text-purple-700 border-purple-100"
                              : item.role === "Manager"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-slate-50 text-slate-600 border-slate-100"
                            }`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${item.status === "ACTIVE"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                        >
                          {item.status === "ACTIVE" ? "활성" : "잠금"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        <span className={item.otpEnabled ? "text-slate-800" : "text-red-500 font-bold"}>
                          {item.otpEnabled ? "Y" : "N"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{item.lastLogin}</td>
                      <td className="px-6 py-4 text-slate-500">{item.createdDate}</td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        조회된 관리자가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
              <span className="text-sm font-medium text-slate-500">
                총 {totalItems}건
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`inline-flex size-9 items-center justify-center rounded-lg text-sm font-semibold transition ${currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
