"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, UploadCloud, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_COLORS: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: "#7c3aed",
  DID_NOT_CONNECT: "#f59e0b",
  BAD_LEAD: "#ef4444",
  SALE_DONE: "#10b981",
  UNSET: "#94a3b8",
};

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  trend: { date: string; count: number }[];
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLeadStats()
      .then((res) => setStats(res))
      .catch(() => setStats({ total: 0, byStatus: {}, trend: [] }))
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats
    ? Object.entries(stats.byStatus).map(([status, count]) => ({ name: status, value: count }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Here&apos;s what&apos;s happening with your leads today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={stats?.total ?? 0} icon={Users} accent="brand" />
        <StatCard
          label="Good Follow Ups"
          value={stats?.byStatus?.GOOD_LEAD_FOLLOW_UP ?? 0}
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Sales Closed"
          value={stats?.byStatus?.SALE_DONE ?? 0}
          icon={ArrowUpRight}
          accent="amber"
        />
        <StatCard
          label="Bad / Unreachable"
          value={(stats?.byStatus?.BAD_LEAD ?? 0) + (stats?.byStatus?.DID_NOT_CONNECT ?? 0)}
          icon={XCircle}
          accent="rose"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Leads imported (last 7 days)</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats?.trend ?? []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(v) => v.slice(5)}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }}
                labelStyle={{ color: "#64748b" }}
              />
              <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6"
        >
          <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Lead status breakdown</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] flex-col items-center justify-center text-center text-sm text-slate-400">
              No leads yet — import a CSV to see your breakdown.
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-panel flex flex-col items-center justify-between gap-4 p-6 sm:flex-row"
      >
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Ready to import more leads?</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Upload a CSV from any source and let AI handle the field mapping.
          </p>
        </div>
        <Link href="/dashboard/import" className="btn-primary shrink-0">
          <UploadCloud className="h-4 w-4" /> Import CSV
        </Link>
      </motion.div>
    </div>
  );
}
