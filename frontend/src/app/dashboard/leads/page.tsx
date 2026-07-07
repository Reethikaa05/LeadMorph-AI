"use client";

import { useEffect, useState } from "react";
import { Search, Filter, ChevronDown, Loader2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { api } from "@/lib/api";
import type { CrmRecord } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: "bg-brand-500/10 text-brand-600 dark:text-brand-300",
  DID_NOT_CONNECT: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  BAD_LEAD: "bg-red-500/10 text-red-600 dark:text-red-400",
  SALE_DONE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "": "bg-slate-500/10 text-slate-500",
};

const STATUS_OPTIONS = ["", "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<CrmRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .getLeads({ search, status, page: String(page), limit: String(limit) })
        .then((res) => {
          setLeads((prev) => (page === 1 ? res.leads : [...prev, ...res.leads]));
          setTotal(res.total);
          setHasMore(res.hasMore);
        })
        .catch(() => {
          setLeads([]);
          setTotal(0);
          setHasMore(false);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Your Leads</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitor lead status, assign tasks, and close deals faster. {total.toLocaleString()} total leads.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="input-field !pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input-field appearance-none !pl-10 !pr-9"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <DataTable
        columns={["name", "email", "mobile_without_country_code", "company", "city", "crm_status", "data_source"]}
        rows={leads}
        emptyMessage={loading ? "Loading leads..." : "No leads found. Try importing a CSV."}
        renderCell={(col, row) =>
          col === "crm_status" ? (
            <span className={`badge ${STATUS_STYLES[row[col] as string] || STATUS_STYLES[""]}`}>
              {row[col] || "—"}
            </span>
          ) : (
            String(row[col] ?? "—")
          )
        }
      />

      {hasMore && (
        <div className="flex justify-center">
          <button onClick={() => setPage((p) => p + 1)} className="btn-secondary" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
