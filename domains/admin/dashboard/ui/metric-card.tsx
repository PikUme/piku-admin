import {
  ChartColumnIncreasing,
  ImageIcon,
  Server,
  TrendingUp,
  Users,
} from "lucide-react";

import { IconTile } from "@/shared/ui/icon";

import type { DashboardMetric, MetricKind } from "../model/dashboard-data";

const iconByKind: Record<MetricKind, typeof Users> = {
  members: Users,
  active: ChartColumnIncreasing,
  images: ImageIcon,
  system: Server,
};

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon = iconByKind[metric.kind];
  const isSystem = metric.kind === "system";

  return (
    <article className="dashboard-panel min-h-44 p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-600">{metric.label}</p>
        <IconTile
          icon={Icon}
          tone={metric.kind === "images" ? "amber" : isSystem ? "slate" : "blue"}
        />
      </div>
      <p className="mt-6 text-3xl font-bold tracking-tight text-slate-950">{metric.value}</p>
      <div className={`mt-3 flex items-center gap-2 text-sm ${isSystem ? "text-slate-600" : "text-amber-700"}`}>
        {isSystem ? (
          <span className="size-2 rounded-full bg-emerald-500" />
        ) : (
          <TrendingUp aria-hidden="true" size={16} />
        )}
        <span>
          {metric.trend && `${metric.trend} `}
          {metric.detail}
        </span>
      </div>
    </article>
  );
}
