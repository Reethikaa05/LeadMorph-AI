"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Stepper } from "@/components/Stepper";
import { FileDropzone, FilePreviewCard } from "@/components/FileDropzone";
import { DataTable } from "@/components/DataTable";
import { parseCsvFile, recordsToCsv, downloadCsv } from "@/lib/csv";
import { api } from "@/lib/api";
import type { CrmRecord, SkippedRecord, ProgressEvent } from "@/lib/types";

const STEPS = [
  { label: "Upload", description: "Choose a CSV file" },
  { label: "Preview", description: "Review raw rows" },
  { label: "Processing", description: "AI field mapping" },
  { label: "Results", description: "Imported leads" },
];

const STATUS_STYLES: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: "bg-brand-500/10 text-brand-600 dark:text-brand-300",
  DID_NOT_CONNECT: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  BAD_LEAD: "bg-red-500/10 text-red-600 dark:text-red-400",
  SALE_DONE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "": "bg-slate-500/10 text-slate-500",
};

export default function ImportPage() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [aiMode, setAiMode] = useState<"openai" | "heuristic-fallback" | null>(null);

  const [records, setRecords] = useState<CrmRecord[]>([]);
  const [skipped, setSkipped] = useState<SkippedRecord[]>([]);
  const [resultTab, setResultTab] = useState<"imported" | "skipped">("imported");
  const [processError, setProcessError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setParseError(null);
    setParsing(true);
    try {
      const parsed = await parseCsvFile(f);
      if (parsed.rows.length === 0) {
        setParseError("This CSV file has no data rows.");
        setFile(null);
        return;
      }
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setStep(1);
    } catch (err) {
      setParseError("Could not parse this CSV file. Please check the format.");
    } finally {
      setParsing(false);
    }
  }, []);

  function resetAll() {
    eventSourceRef.current?.close();
    setStep(0);
    setFile(null);
    setHeaders([]);
    setRows([]);
    setProgress(null);
    setAiMode(null);
    setRecords([]);
    setSkipped([]);
    setProcessError(null);
  }

  async function handleConfirmImport(sourceRows = rows) {
    setStep(2);
    setProcessError(null);
    setProgress(null);

    try {
      const { jobId } = await api.startStreamJob(sourceRows, headers);
      const es = new EventSource(api.streamUrl(jobId));
      eventSourceRef.current = es;

      es.addEventListener("progress", (e) => {
        const data = JSON.parse((e as MessageEvent).data) as ProgressEvent;
        setProgress(data);
        setAiMode(data.usedFallback ? "heuristic-fallback" : "openai");
      });

      es.addEventListener("done", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        setRecords((prev) => [...data.records, ...prev]);
        setSkipped((prev) => [...data.skipped, ...prev]);
        setAiMode(data.meta.aiMode);
        setStep(3);
        es.close();
      });

      es.addEventListener("error", (e: any) => {
        const data = e?.data ? JSON.parse(e.data) : null;
        setProcessError(data?.message || "Something went wrong while processing your CSV.");
        setStep(1);
        es.close();
      });
    } catch (err: any) {
      setProcessError(err?.message || "Failed to start processing job.");
      setStep(1);
    }
  }

  function handleRetrySkipped() {
    // Resubmits the original raw rows tied to skipped indices for another attempt
    const rowsToRetry = skipped
      .map((s) => rows[s.row - 1])
      .filter(Boolean) as Record<string, string>[];
    if (rowsToRetry.length === 0) return;
    setSkipped([]);
    handleConfirmImport(rowsToRetry);
  }

  function handleExport() {
    if (records.length === 0) return;
    downloadCsv(`groweasy_crm_import_${Date.now()}.csv`, recordsToCsv(records));
  }

  const successRate = records.length + skipped.length > 0
    ? Math.round((records.length / (records.length + skipped.length)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Import Leads via CSV</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload a CSV file to bulk import leads into your system.
        </p>
      </div>

      <div className="glass-panel p-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="upload" {...fadeProps} className="space-y-4">
            <FileDropzone onFileAccepted={handleFile} />
            {parsing && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Parsing your CSV file...
              </div>
            )}
            {parseError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                <AlertTriangle className="h-4 w-4" /> {parseError}
              </div>
            )}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="preview" {...fadeProps} className="space-y-4">
            {file && <FilePreviewCard file={file} onRemove={resetAll} />}

            {processError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                <AlertTriangle className="h-4 w-4" /> {processError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Preview — {rows.length.toLocaleString()} rows, {headers.length} columns
              </p>
              <span className="badge bg-slate-500/10 text-slate-500">No AI has run yet</span>
            </div>

            <DataTable columns={headers} rows={rows} />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button onClick={resetAll} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleConfirmImport()} className="btn-primary">
                Confirm & Import <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="processing" {...fadeProps} className="glass-panel flex flex-col items-center gap-5 p-12 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-brand-400 animate-pulse-ring" />
              <Sparkles className="h-7 w-7 text-brand-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                AI is mapping your leads to CRM fields...
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {progress
                  ? `Processed batch ${progress.batch} of ${progress.totalBatches}`
                  : "Starting batch processing..."}
              </p>
            </div>

            <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500"
                animate={{
                  width: progress
                    ? `${Math.round((progress.completedBatches / progress.totalBatches) * 100)}%`
                    : "8%",
                }}
                transition={{ ease: "easeOut" }}
              />
            </div>

            {progress && (
              <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                <span>Imported so far: {progress.importedSoFar}</span>
                <span>Skipped so far: {progress.skippedSoFar}</span>
              </div>
            )}
            {aiMode === "heuristic-fallback" && (
              <p className="max-w-sm text-xs text-amber-500">
                Running in heuristic fallback mode (no OPENAI_API_KEY configured on the server) —
                field mapping is still fully functional using rule-based matching.
              </p>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="results" {...fadeProps} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <ResultStat icon={CheckCircle2} label="Total Imported" value={records.length} accent="emerald" />
              <ResultStat icon={XCircle} label="Total Skipped" value={skipped.length} accent="rose" />
              <ResultStat icon={Sparkles} label="Success Rate" value={successRate} suffix="%" accent="brand" />
            </div>

            {aiMode === "heuristic-fallback" && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Processed using the heuristic fallback engine (no AI key configured).
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-1">
                <button
                  onClick={() => setResultTab("imported")}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    resultTab === "imported" ? "bg-brand-500 text-white shadow" : "text-slate-500"
                  }`}
                >
                  Imported ({records.length})
                </button>
                <button
                  onClick={() => setResultTab("skipped")}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    resultTab === "skipped" ? "bg-brand-500 text-white shadow" : "text-slate-500"
                  }`}
                >
                  Skipped ({skipped.length})
                </button>
              </div>

              <div className="flex gap-2">
                {skipped.length > 0 && (
                  <button onClick={handleRetrySkipped} className="btn-secondary !py-2 text-sm">
                    <RotateCcw className="h-3.5 w-3.5" /> Retry skipped
                  </button>
                )}
                <button onClick={handleExport} className="btn-secondary !py-2 text-sm">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
                <button onClick={resetAll} className="btn-primary !py-2 text-sm">
                  Import another file
                </button>
              </div>
            </div>

            {resultTab === "imported" ? (
              <DataTable
                columns={[
                  "name",
                  "email",
                  "mobile_without_country_code",
                  "company",
                  "city",
                  "crm_status",
                  "data_source",
                  "crm_note",
                ]}
                rows={records}
                emptyMessage="No records were imported."
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
            ) : (
              <DataTable
                columns={["row", "reason"]}
                rows={skipped}
                emptyMessage="No rows were skipped 🎉"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fadeProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25 },
};

function ResultStat({
  icon: Icon,
  label,
  value,
  suffix = "",
  accent,
}: {
  icon: any;
  label: string;
  value: number;
  suffix?: string;
  accent: "emerald" | "rose" | "brand";
}) {
  const accentMap = {
    emerald: "from-emerald-500 to-teal-400",
    rose: "from-rose-500 to-pink-500",
    brand: "from-brand-500 to-fuchsia-500",
  };
  return (
    <div className="glass-panel flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accentMap[accent]} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
          {suffix}
        </p>
      </div>
    </div>
  );
}
