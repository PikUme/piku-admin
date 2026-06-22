"use client";

import {
  CalendarDays,
  Clock,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { type KPICardData } from "../model/statistics-data";

interface KPICardsProps {
  items: KPICardData[];
}

export function KPICards({ items }: KPICardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = getIcon(item.iconKind);
        const iconBgColor = getIconBgColor(item.iconKind);
        const iconColor = getIconColor(item.iconKind);

        return (
          <div
            key={item.label}
            className="flex flex-col justify-between p-6 rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">{item.label}</span>
              <div className={`p-2 rounded-lg ${iconBgColor} ${iconColor}`}>
                <Icon size={20} aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {item.value}
              </span>
              {item.trend && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.trend.isPositive
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}
                >
                  {item.trend.isPositive ? (
                    <TrendingUp size={12} aria-hidden="true" />
                  ) : (
                    <TrendingDown size={12} aria-hidden="true" />
                  )}
                  {item.trend.value}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getIcon(kind: KPICardData["iconKind"]) {
  switch (kind) {
    case "users":
      return UsersRound;
    case "chart":
      return TrendingUp;
    case "calendar":
      return CalendarDays;
    case "clock":
      return Clock;
  }
}

function getIconBgColor(kind: KPICardData["iconKind"]) {
  switch (kind) {
    case "users":
      return "bg-blue-100";
    case "chart":
      return "bg-orange-100";
    case "calendar":
      return "bg-slate-100";
    case "clock":
      return "bg-rose-100";
  }
}

function getIconColor(kind: KPICardData["iconKind"]) {
  switch (kind) {
    case "users":
      return "text-blue-600";
    case "chart":
      return "text-orange-600";
    case "calendar":
      return "text-slate-600";
    case "clock":
      return "text-rose-600";
  }
}
