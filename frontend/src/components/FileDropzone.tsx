"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileSpreadsheet, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/csv";

export function FileDropzone({
  onFileAccepted,
}: {
  onFileAccepted: (file: File) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setError(null);
      if (rejected.length > 0) {
        setError("Only .csv files up to 5MB are supported.");
        return;
      }
      if (accepted[0]) onFileAccepted(accepted[0]);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          isDragActive
            ? "border-brand-500 bg-brand-500/5 scale-[1.01]"
            : "border-slate-300 dark:border-white/15 hover:border-brand-400 hover:bg-brand-500/[0.03]"
        }`}
      >
        <input {...getInputProps()} />
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-fuchsia-500/10 transition-transform duration-300 ${
            isDragActive ? "scale-110" : "group-hover:scale-105"
          }`}
        >
          {isDragActive ? (
            <FileSpreadsheet className="h-7 w-7 text-brand-500" />
          ) : (
            <UploadCloud className="h-7 w-7 text-brand-500" />
          )}
        </div>
        <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {isDragActive ? "Drop your CSV here" : "Drag & drop your CSV file here"}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          or <span className="font-medium text-brand-500 underline underline-offset-2">click to browse files</span>
        </p>
        <div className="mt-4 flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
          Supported file: .csv (max 5MB)
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Works with Facebook Lead Ads, Google Ads, real-estate CRM exports, sales reports, or
        manually created spreadsheets — any column layout.
      </p>
    </div>
  );
}

export function FilePreviewCard({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="glass-panel flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{file.name}</p>
          <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-black/5 dark:hover:bg-white/10"
      >
        Remove
      </button>
    </div>
  );
}
