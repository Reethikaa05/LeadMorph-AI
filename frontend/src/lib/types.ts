export type CrmStatus =
  | "GOOD_LEAD_FOLLOW_UP"
  | "DID_NOT_CONNECT"
  | "BAD_LEAD"
  | "SALE_DONE"
  | "";

export type DataSource =
  | "leads_on_demand"
  | "meridian_tower"
  | "eden_park"
  | "varah_swamy"
  | "sarjapur_plots"
  | "";

export interface CrmRecord {
  id?: string;
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CrmStatus;
  crm_note: string;
  data_source: DataSource;
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  row: number;
  reason: string;
}

export interface ProcessResult {
  success: boolean;
  records: CrmRecord[];
  skipped: SkippedRecord[];
  meta: {
    totalRows: number;
    totalImported: number;
    totalSkipped: number;
    totalBatches: number;
    aiMode: "openai" | "heuristic-fallback";
  };
}

export interface UploadResult {
  success: boolean;
  fileName: string;
  fileSizeKb: number;
  headers: string[];
  rowCount: number;
  rows: Record<string, string>[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  createdAt: string;
}

export interface ProgressEvent {
  type: "progress";
  batch: number;
  totalBatches: number;
  completedBatches: number;
  usedFallback: boolean;
  batchError: string | null;
  importedSoFar: number;
  skippedSoFar: number;
}
