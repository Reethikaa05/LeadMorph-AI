"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Users,
  Settings,
  Radio,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/import", label: "Import Leads", icon: UploadCloud },
  { href: "/dashboard/leads", label: "Manage Leads", icon: Users },
  { href: "/dashboard/settings", label: "Lead Sources", icon: Radio },
  { href: "/dashboard/account", label: "Account Settings", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#0f0b1f]/90 backdrop-blur-xl px-4 py-6 transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-brand-500/15 to-fuchsia-500/10 text-brand-600 dark:text-brand-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon className={clsx("h-4.5 w-4.5 transition-transform group-hover:scale-110", active && "text-brand-500")} />
                {label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500 shadow-glow" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="glass-panel !bg-gradient-to-br !from-brand-500/10 !to-fuchsia-500/10 p-4 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-100">Need bulk imports?</p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Drop any CSV export and let AI map it to your CRM schema automatically.
          </p>
          <Link href="/dashboard/import" onClick={onClose} className="btn-primary mt-3 w-full !py-2 text-xs">
            Import CSV
          </Link>
        </div>
      </aside>
    </>
  );
}
