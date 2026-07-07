"use client";

import { LucideIcon } from "lucide-react";
import { useCountUp } from "@/lib/useCountUp";
import clsx from "clsx";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
  suffix = "",
  delta,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: "brand" | "emerald" | "amber" | "rose";
  suffix?: string;
  delta?: string;
}) {
  const animated = useCountUp(value);

  const accentMap: Record<string, string> = {
    brand: "from-brand-500 to-fuchsia-500 text-brand-500",
    emerald: "from-emerald-500 to-teal-400 text-emerald-500",
    amber: "from-amber-500 to-orange-400 text-amber-500",
    rose: "from-rose-500 to-pink-500 text-rose-500",
  };

  return (
    <div className="glass-panel group relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1">
      <div
        className={clsx(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-20",
          accentMap[accent]
        )}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            accentMap[accent]
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {animated.toLocaleString()}
        {suffix}
      </p>
      {delta && <p className="mt-1 text-xs font-medium text-emerald-500">{delta}</p>}
    </div>
  );
}
