"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  UploadCloud,
  Sparkles,
  Table2,
  ShieldCheck,
  Zap,
  Gauge,
  RefreshCw,
} from "lucide-react";
import { GradientBackground } from "@/components/GradientBackground";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Field Mapping",
    desc: "Automatically maps messy, inconsistent column names to the GrowEasy CRM schema — no templates required.",
  },
  {
    icon: UploadCloud,
    title: "Any CSV Format",
    desc: "Facebook Lead Ads, Google Ads, real-estate exports, sales reports, or a spreadsheet you made by hand.",
  },
  {
    icon: Table2,
    title: "Beautiful Previews",
    desc: "Review every row in a fast, virtualized table with sticky headers before anything touches AI.",
  },
  {
    icon: ShieldCheck,
    title: "Smart Validation",
    desc: "Rows without an email or phone are automatically skipped and reported — nothing silently lost.",
  },
  {
    icon: RefreshCw,
    title: "Retry & Fallback",
    desc: "Failed AI batches automatically retry, then fall back to a deterministic heuristic engine.",
  },
  {
    icon: Gauge,
    title: "Live Progress",
    desc: "Streamed, batch-by-batch progress so you always know exactly what's happening.",
  },
];

const STEPS = [
  { title: "Upload", desc: "Drag & drop any CSV export — no fixed column names required." },
  { title: "Preview", desc: "Instantly review every row in a responsive, scrollable table." },
  { title: "Confirm", desc: "One click sends your data to AI for intelligent field mapping." },
  { title: "Import", desc: "Get clean, structured CRM leads — with skipped rows called out." },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <GradientBackground />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="btn-secondary !px-4 !py-2 text-sm">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary !px-4 !py-2 text-sm">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/5 px-4 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-300"
        >
          <Zap className="h-3.5 w-3.5" /> AI-Powered CSV → CRM Importer
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-6xl"
        >
          Turn any messy CSV into
          <br />
          <span className="bg-gradient-to-r from-brand-500 via-fuchsia-500 to-brand-400 bg-clip-text text-transparent">
            clean CRM leads
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 max-w-2xl text-base text-slate-500 dark:text-slate-400 sm:text-lg"
        >
          Upload leads from Facebook, Google Ads, Excel, or any CRM export. GrowEasy&apos;s AI
          engine intelligently maps every column — regardless of naming or layout — into a
          consistent, importable CRM format.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link href="/signup" className="btn-primary text-base">
            Start importing leads <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="btn-secondary text-base">
            I already have an account
          </Link>
        </motion.div>

        {/* Product preview mock */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="glass-panel mt-16 w-full max-w-4xl overflow-hidden p-2"
        >
          <div className="flex items-center gap-1.5 border-b border-black/5 dark:border-white/10 px-3 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 text-xs text-slate-400">CRM_leads_import.csv — GrowEasy</span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            {["Total Rows", "Imported", "Skipped", "Success Rate"].map((label, i) => (
              <div key={label} className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-4 text-left">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                  {[128, 121, 7, "94.5%"][i]}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2 px-4 pb-4">
            {[
              ["Amit Shetty", "amit.shetty@example.com", "GOOD_LEAD_FOLLOW_UP"],
              ["Priya Rao", "priya.rao@example.com", "SALE_DONE"],
              ["Rahul Mohammed", "rahul@test.com", "DID_NOT_CONNECT"],
            ].map((row) => (
              <div
                key={row[1]}
                className="flex items-center justify-between rounded-lg bg-black/[0.015] dark:bg-white/[0.02] px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">{row[0]}</span>
                <span className="hidden text-slate-400 sm:block">{row[1]}</span>
                <span className="badge bg-brand-500/10 text-brand-600 dark:text-brand-300">{row[2]}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          How it works
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-panel p-6"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 text-sm font-bold text-white">
                {i + 1}
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Built for messy, real-world data
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-panel p-6 transition-transform hover:-translate-y-1"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5 dark:border-white/10 py-8 text-center text-sm text-slate-400">
        Built for the GrowEasy AI CSV Importer assignment · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
