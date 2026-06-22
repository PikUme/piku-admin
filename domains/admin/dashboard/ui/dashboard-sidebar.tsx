"use client";

import {
  ChartNoAxesCombined,
  History,
  LayoutDashboard,
  type LucideIcon,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { ADMIN_ROLE } from "@/shared/api/admin-auth/contracts";
import { useAuthenticatedAdmin } from "@/shared/api/admin-auth/use-authenticated-admin";

interface DashboardNavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const defaultNavItems: DashboardNavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Statistics", icon: ChartNoAxesCombined, href: "/admin/statistics" },
];

const adminManagementItem: DashboardNavItem = {
  label: "Admin Management",
  icon: UsersRound,
  href: "#",
};

const trailingNavItems: DashboardNavItem[] = [
  { label: "Audit Log", icon: History, href: "#" },
];

export function DashboardSidebar({ activeLabel = "Dashboard" }: { activeLabel?: string }) {
  const admin = useAuthenticatedAdmin();
  const navItems =
    admin?.role === ADMIN_ROLE.SUPER_ADMIN
      ? [...defaultNavItems, adminManagementItem, ...trailingNavItems]
      : [...defaultNavItems, ...trailingNavItems];

  return (
    <aside className="hidden min-h-screen border-r border-slate-200 bg-slate-50 lg:flex lg:flex-col">
      <div className="px-7 py-8">
        <p className="text-2xl font-extrabold tracking-tight text-blue-700">Pikume</p>
        <p className="mt-1 text-sm font-medium text-slate-700">Admin Console</p>
      </div>
      <nav className="px-3" aria-label="관리자 메뉴">
        <ul className="space-y-2">
          {navItems.map(({ label, icon: Icon, href }) => {
            const active = label === activeLabel;
            return (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-4 rounded-r-xl border-l-4 px-4 py-3.5 text-[15px] font-medium transition-colors ${
                    active
                      ? "border-blue-600 bg-blue-100 text-blue-800"
                      : "border-transparent text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon aria-hidden="true" size={21} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <a
        className="mx-5 mt-auto mb-7 flex items-center gap-4 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
        href="#"
      >
        <UserRound aria-hidden="true" size={20} />
        My Profile
      </a>
    </aside>
  );
}
