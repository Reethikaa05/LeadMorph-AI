"use client";

import { useState } from "react";
import { Menu, Search, LogOut, ChevronDown } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#0c0918]/80 px-4 py-3 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search leads, sources, campaigns..."
          className="input-field !pl-9"
        />
      </div>
      <div className="flex-1 sm:hidden" />

      <ThemeToggle />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 py-1.5 pl-1.5 pr-2.5 transition-all hover:bg-white dark:hover:bg-white/10"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs font-bold text-white">
            {initials || "U"}
          </div>
          <span className="hidden text-sm font-medium sm:block">{user?.name || "Account"}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 animate-fade-in-up rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#15102a] p-1.5 shadow-card">
            <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
