import { Sparkles } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`relative flex ${dims} items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-fuchsia-500 shadow-glow`}
      >
        <Sparkles className="h-1/2 w-1/2 text-white" strokeWidth={2.5} />
      </div>
      <span className={`${text} font-bold tracking-tight text-slate-900 dark:text-white`}>
        GrowEasy
      </span>
    </div>
  );
}
