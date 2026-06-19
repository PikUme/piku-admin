import type { LucideIcon } from "lucide-react";

export function IconTile({
  icon: Icon,
  tone = "blue",
}: {
  icon: LucideIcon;
  tone?: "blue" | "amber" | "slate";
}) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`inline-flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}>
      <Icon aria-hidden="true" size={21} strokeWidth={2} />
    </span>
  );
}
