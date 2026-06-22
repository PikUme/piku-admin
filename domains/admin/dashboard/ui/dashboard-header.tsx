import {
  Bell,
  ChevronRight,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
} from "lucide-react";

export function DashboardHeader({ title = "Dashboard" }: { title?: string }) {
  return (
    <header className="flex min-h-18 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button className="icon-button lg:hidden" type="button" aria-label="메뉴 열기">
          <Menu aria-hidden="true" size={21} />
        </button>
        <span className="hidden text-sm font-semibold text-slate-700 sm:inline">Pikume</span>
        <ChevronRight className="hidden text-slate-400 sm:block" aria-hidden="true" size={16} />
        <h1 className="truncate text-base font-bold text-blue-700">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 md:flex">
          <Clock3 aria-hidden="true" size={17} />
          <span>2024-05-20 14:30 (KST)</span>
          <span className="h-5 w-px bg-slate-300" />
          <RefreshCw aria-hidden="true" size={17} />
        </div>
        <button className="icon-button" type="button" aria-label="새로고침">
          <RefreshCw aria-hidden="true" className="md:hidden" size={19} />
          <Bell aria-hidden="true" className="hidden md:block" size={20} />
        </button>
        <button className="icon-button hidden sm:inline-flex" type="button" aria-label="도움말">
          <CircleHelp aria-hidden="true" size={20} />
        </button>
        <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />
        <button className="hidden items-center gap-2 px-2 py-2 text-sm font-medium text-slate-700 sm:flex" type="button">
          Logout
          <LogOut aria-hidden="true" size={18} />
        </button>
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 lg:hidden">
          <LayoutDashboard aria-hidden="true" size={19} />
        </span>
      </div>
    </header>
  );
}
