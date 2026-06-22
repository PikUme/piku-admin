"use client";

import { type TabKind } from "../model/statistics-data";

interface TabItem {
  id: TabKind;
  label: string;
}

const TABS: TabItem[] = [
  { id: "visitor", label: "방문/DAU" },
  { id: "member", label: "회원/가입" },
  { id: "diary", label: "일기 생성" },
  { id: "photo", label: "AI 사진" },
];

interface StatisticsTabsProps {
  activeTab: TabKind;
  onTabChange: (tab: TabKind) => void;
}

export function StatisticsTabs({ activeTab, onTabChange }: StatisticsTabsProps) {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex gap-8" aria-label="통계 분류">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`border-b-2 py-4 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "border-blue-600 text-blue-700 font-bold"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
