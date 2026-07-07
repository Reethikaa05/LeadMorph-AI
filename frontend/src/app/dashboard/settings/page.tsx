"use client";

import { useState } from "react";
import { Facebook, Chrome, MessageCircle, Phone, Radio, CheckCircle2, Link2, AlertCircle } from "lucide-react";

export default function LeadSourcesPage() {
  const [sources, setSources] = useState([
    { name: "Facebook Lead Ads", icon: Facebook, connected: true, description: "Stream leads directly from Facebook Forms" },
    { name: "Google Ads", icon: Chrome, connected: true, description: "Import leads from Google search campaigns" },
    { name: "WhatsApp Business", icon: MessageCircle, connected: true, description: "Sync contacts and enquiries from WhatsApp chat" },
    { name: "Tele Calling", icon: Phone, connected: true, description: "Log phone conversations and outbound calls" },
  ]);

  const toggleConnection = (name: string) => {
    setSources((prev) =>
      prev.map((src) =>
        src.name === name ? { ...src, connected: !src.connected } : src
      )
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lead Channels & Sources</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Connect, manage, and toggle lead ingestion sources for your GrowEasy CRM.
        </p>
      </div>

      {/* Main CSV Importer Info Card */}
      <div className="glass-panel flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center bg-gradient-to-r from-brand-500/5 to-fuchsia-500/5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-md">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">CSV Importer Engine</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Bulk import and AI-map records from any CSV or spreadsheet</p>
          </div>
        </div>
        <a href="/dashboard/import" className="btn-primary !py-2 !px-4 text-sm font-semibold shadow-sm">
          Import CSV Now
        </a>
      </div>

      {/* Grid of sources */}
      <div className="grid gap-4 sm:grid-cols-2">
        {sources.map((source) => (
          <div key={source.name} className="glass-panel flex flex-col justify-between p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                  <source.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{source.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{source.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${source.connected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {source.connected ? "Active Syncing" : "Disconnected"}
                </span>
              </div>

              <button
                onClick={() => toggleConnection(source.name)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  source.connected
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
                    : "bg-slate-100 hover:bg-brand-500 hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-600 dark:hover:text-white"
                }`}
              >
                {source.connected ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Alert */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-2.5 text-blue-600 dark:text-blue-400 text-xs">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong>Pro-Tip:</strong> The CSV Importer is decoupled from live channels, meaning you can import spreadsheet data regardless of your API channel connectivity status.
        </p>
      </div>
    </div>
  );
}
