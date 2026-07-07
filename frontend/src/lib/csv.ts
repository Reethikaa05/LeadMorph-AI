import Papa from "papaparse";
import type { CrmRecord } from "./types";

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

/** Parses a File into headers + row objects, purely client-side (Step 2: preview, no AI). */
export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        resolve({ headers, rows });
      },
      error: (err) => reject(err),
    });
  });
}

const CRM_HEADERS: (keyof CrmRecord)[] = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
];

/** Converts CRM records back into a downloadable CSV string. */
export function recordsToCsv(records: CrmRecord[]): string {
  const rows = records.map((r) => CRM_HEADERS.map((h) => r[h] ?? ""));
  return Papa.unparse({ fields: CRM_HEADERS as string[], data: rows });
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
