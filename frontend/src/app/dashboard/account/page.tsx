"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { 
  LogOut, 
  Mail, 
  Building2, 
  Calendar, 
  User, 
  Save, 
  Check, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Settings 
} from "lucide-react";

export default function AccountPage() {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || "");
  const [company, setCompany] = useState(user?.company || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSaveStatus({ type: "error", message: "Name is required." });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    try {
      await updateUser(name, company);
      setSaveStatus({ type: "success", message: "Profile updated successfully!" });
      setTimeout(() => {
        setSaveStatus({ type: null, message: "" });
      }, 3000);
    } catch (err: any) {
      setSaveStatus({ 
        type: "error", 
        message: err.message || "Failed to update profile. Please try again." 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "US";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal profile, company details, and application preferences.
        </p>
      </div>

      {/* Profile Header Banner */}
      <div className="glass-panel overflow-hidden">
        <div className="h-28 w-full bg-gradient-to-r from-brand-600 via-indigo-600 to-fuchsia-600 opacity-95"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 mb-2">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-2xl font-bold text-white shadow-lg ring-4 ring-white dark:ring-slate-900">
                {initials}
              </div>
              <div className="mb-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Account
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="glass-panel p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-4">
              <User className="h-5 w-5 text-brand-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Details</h3>
            </div>

            {saveStatus.type && (
              <div className={`p-4 rounded-xl text-sm flex items-start gap-2 ${
                saveStatus.type === "success" 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}>
                {saveStatus.type === "success" ? <Check className="h-4 w-4 mt-0.5" /> : null}
                <span>{saveStatus.message}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Company Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Building2 className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="Enter your company"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="input-field bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary flex items-center gap-2 !py-2.5 !px-5 text-sm"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Preferences & Actions */}
        <div className="space-y-6">
          {/* Preferences Card */}
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-4">
              <Settings className="h-5 w-5 text-brand-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">App Settings</h3>
            </div>

            {/* Theme Toggle option */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Display Theme
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => theme === "dark" && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${
                    theme === "light"
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sun className="h-4 w-4" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => theme === "light" && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${
                    theme === "dark"
                      ? "bg-slate-700 text-white shadow-sm font-semibold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Moon className="h-4 w-4" /> Dark
                </button>
              </div>
            </div>

            {/* Quick Stats info */}
            <div className="space-y-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
              {user?.createdAt && (
                <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Registered</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
                <span>Account ID</span>
                <span className="font-mono text-slate-800 dark:text-slate-300 truncate max-w-[120px]" title={user?.id}>
                  {user?.id?.slice(0, 8)}...
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <LogOut className="h-4 w-4" /> Log out of session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
