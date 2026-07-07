export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("groweasy_token");
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const token = auth ? getToken() : null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed with status ${res.status}`, res.status);
  }
  return data as T;
}

export const api = {
  signup: (payload: { name: string; email: string; password: string; company?: string }) =>
    request<{ success: boolean; token: string; user: any }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),

  me: () => request<{ success: boolean; user: any }>("/auth/me"),

  uploadCsv: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<any>("/csv/upload", { method: "POST", body: form });
  },

  processCsv: (rows: Record<string, string>[], headers: string[]) =>
    request<any>("/csv/process", {
      method: "POST",
      body: JSON.stringify({ rows, headers }),
    }),

  startStreamJob: (rows: Record<string, string>[], headers: string[]) =>
    request<{ success: boolean; jobId: string }>("/csv/process-stream/start", {
      method: "POST",
      body: JSON.stringify({ rows, headers }),
    }),

  streamUrl: (jobId: string) => `${API_BASE_URL}/csv/process-stream/${jobId}`,

  getLeads: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<any>(`/leads${qs ? `?${qs}` : ""}`);
  },

  getLeadStats: () => request<any>("/leads/stats"),

  updateProfile: (payload: { name: string; company?: string }) =>
    request<{ success: boolean; user: any }>("/auth/update", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
