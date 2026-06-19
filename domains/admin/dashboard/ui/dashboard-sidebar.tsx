import {
  ChartNoAxesCombined,
  History,
  LayoutDashboard,
  UserRound,
  UsersRound,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Statistics", icon: ChartNoAxesCombined },
  { label: "Admin Management", icon: UsersRound },
  { label: "Audit Log", icon: History },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden min-h-screen border-r border-slate-200 bg-slate-50 lg:flex lg:flex-col">
      <div className="px-7 py-8">
        <p className="text-2xl font-extrabold tracking-tight text-blue-700">Pikume</p>
        <p className="mt-1 text-sm font-medium text-slate-700">Admin Console</p>
      </div>
      <nav className="px-3" aria-label="관리자 메뉴">
        <ul className="space-y-2">
          {navItems.map(({ label, icon: Icon, active }) => (
            <li key={label}>
              <a
                href="#"
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-4 rounded-r-xl border-l-4 px-4 py-3.5 text-[15px] font-medium transition-colors ${
                  active
                    ? "border-blue-600 bg-blue-100 text-blue-800"
                    : "border-transparent text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon aria-hidden="true" size={21} />
                {label}
              </a>
            </li>
          ))}
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
