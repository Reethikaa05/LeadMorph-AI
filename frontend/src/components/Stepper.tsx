"use client";

import { Check } from "lucide-react";
import clsx from "clsx";

export interface Step {
  label: string;
  description: string;
}

export function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="flex w-full items-start">
      {steps.map((step, idx) => {
        const isDone = idx < current;
        const isActive = idx === current;
        return (
          <div key={step.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={clsx(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                  isDone && "border-brand-500 bg-brand-500 text-white",
                  isActive && "border-brand-500 text-brand-500 shadow-glow",
                  !isDone && !isActive && "border-slate-300 dark:border-white/15 text-slate-400"
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-full border-2 border-brand-400 animate-pulse-ring" />
                )}
                {isDone ? <Check className="h-4.5 w-4.5" /> : idx + 1}
              </div>
              <div className="hidden text-center sm:block">
                <p
                  className={clsx(
                    "text-xs font-semibold",
                    isActive || isDone ? "text-slate-900 dark:text-white" : "text-slate-400"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-400">{step.description}</p>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-fuchsia-500 transition-all duration-500"
                  style={{ width: isDone ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
