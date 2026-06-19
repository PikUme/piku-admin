import {
  AlertCircle,
  CircleCheck,
  TriangleAlert,
  UserRoundPlus,
} from "lucide-react";

import { dashboardIssues, type IssueTone } from "../model/dashboard-data";

const toneStyles: Record<IssueTone, string> = {
  danger: "text-red-600",
  success: "text-emerald-600",
  warning: "text-amber-600",
  info: "text-blue-600",
};

const toneIcons = {
  danger: AlertCircle,
  success: CircleCheck,
  warning: TriangleAlert,
  info: UserRoundPlus,
};

export function IssuesPanel() {
  return (
    <div className="divide-y divide-slate-200">
      {dashboardIssues.map((issue) => {
        const Icon = toneIcons[issue.tone];
        return (
          <article className="flex items-start gap-4 px-5 py-4" key={issue.title}>
            <Icon className={`mt-1 shrink-0 ${toneStyles[issue.tone]}`} aria-hidden="true" size={19} />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">{issue.title}</h3>
              <p className="mt-0.5 truncate text-sm text-slate-600">{issue.description}</p>
            </div>
            <time className="shrink-0 pt-1 text-xs text-slate-500">{issue.time}</time>
          </article>
        );
      })}
    </div>
  );
}
