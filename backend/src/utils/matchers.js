/**
 * Heuristic ("dumb AI") fallback engine.
 *
 * The assignment expects an LLM to do the field mapping. This module is a
 * deterministic, dependency-free safety net used whenever no AI provider is
 * configured (no OPENAI_API_KEY) or whenever an AI batch fails after all
 * retries. It keeps the product usable out-of-the-box for reviewers and
 * demonstrates graceful degradation instead of a hard failure.
 */

const FIELD_KEYWORDS = {
  created_at: ["created", "date", "timestamp", "time", "added on", "created_at"],
  name: ["name", "full name", "lead name", "contact name", "customer"],
  email: ["email", "e-mail", "mail id", "mail"],
  country_code: ["country code", "isd", "dial code", "std code"],
  mobile_without_country_code: [
    "mobile", "phone", "contact number", "contact no", "whatsapp", "cell", "number", "phone number",
  ],
  company: ["company", "organisation", "organization", "business", "firm"],
  city: ["city", "town"],
  state: ["state", "province", "region"],
  country: ["country"],
  lead_owner: ["owner", "assigned to", "agent", "sales rep", "handled by", "executive"],
  crm_status: ["status", "stage", "lead status", "disposition"],
  crm_note: ["note", "remark", "comment", "feedback", "description of call"],
  data_source: ["source", "campaign", "channel", "lead source", "utm_source", "form name"],
  possession_time: ["possession"],
  description: ["description", "details", "message", "enquiry", "requirement"],
};

const ALLOWED_STATUS = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
const ALLOWED_SOURCE = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];

const STATUS_KEYWORDS = {
  SALE_DONE: ["sale done", "won", "closed won", "deal closed", "converted", "booked"],
  BAD_LEAD: ["bad lead", "not interested", "junk", "invalid", "spam", "disqualified"],
  DID_NOT_CONNECT: ["did not connect", "no answer", "not reachable", "busy", "no response", "ringing", "switched off"],
  GOOD_LEAD_FOLLOW_UP: ["good lead", "follow up", "interested", "hot lead", "warm", "in progress"],
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

function normalizeHeader(h) {
  return String(h || "")
    .toLowerCase()
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  const longer = Math.max(a.length, b.length) || 1;
  return 1 - levenshtein(a, b) / longer;
}

/** Map every CSV header to the best matching CRM field (or null). */
function buildHeaderMap(headers) {
  const map = {};
  const usedFields = new Set();
  const normalizedHeaders = headers.map(normalizeHeader);

  Object.keys(FIELD_KEYWORDS).forEach((field) => {
    let bestHeader = null;
    let bestScore = 0;

    normalizedHeaders.forEach((normHeader, idx) => {
      const originalHeader = headers[idx];
      if (usedFields.has(originalHeader)) return;

      FIELD_KEYWORDS[field].forEach((keyword) => {
        let score = 0;
        if (normHeader === keyword) score = 1;
        else if (normHeader.includes(keyword) || keyword.includes(normHeader)) score = 0.85;
        else score = similarity(normHeader, keyword);

        if (score > bestScore) {
          bestScore = score;
          bestHeader = originalHeader;
        }
      });
    });

    if (bestHeader && bestScore >= 0.55) {
      map[field] = bestHeader;
      usedFields.add(bestHeader);
    }
  });

  return map;
}

function normalizeStatus(rawValue) {
  if (!rawValue) return "";
  const val = String(rawValue).toLowerCase();
  if (ALLOWED_STATUS.includes(String(rawValue).toUpperCase())) return String(rawValue).toUpperCase();
  for (const status of Object.keys(STATUS_KEYWORDS)) {
    if (STATUS_KEYWORDS[status].some((kw) => val.includes(kw))) return status;
  }
  return "";
}

function normalizeSource(rawValue) {
  if (!rawValue) return "";
  const val = String(rawValue).toLowerCase().replace(/\s+/g, "_");
  const match = ALLOWED_SOURCE.find((src) => val.includes(src) || src.includes(val));
  return match || "";
}

function extractAll(regex, text) {
  return [...String(text || "").matchAll(regex)].map((m) => m[0]);
}

function toIsoDate(raw) {
  if (!raw) return new Date().toISOString();
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 19).replace("T", " ");
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Convert a batch of raw CSV row objects into CRM-shaped records using the
 * heuristic header map. Returns { records, skipped }.
 */
function heuristicExtract(rows, headers) {
  const headerMap = buildHeaderMap(headers);
  const records = [];
  const skipped = [];

  rows.forEach((row, index) => {
    const get = (field) => (headerMap[field] ? row[headerMap[field]] : undefined);

    // Gather every cell's text to hunt for emails/phones anywhere in the row
    const allCellText = Object.values(row).join(" | ");
    const emailsFound = [
      ...new Set([get("email"), ...extractAll(EMAIL_REGEX, allCellText)].filter(Boolean)),
    ];
    const phonesFound = [
      ...new Set(
        [get("mobile_without_country_code"), ...extractAll(PHONE_REGEX, allCellText)]
          .filter(Boolean)
          .map((p) => String(p).replace(/[^\d+]/g, ""))
          .filter((p) => p.length >= 7)
      ),
    ];

    if (emailsFound.length === 0 && phonesFound.length === 0) {
      skipped.push({ row: index + 1, reason: "No email or mobile number found", raw: row });
      return;
    }

    const extraNotesParts = [];
    if (emailsFound.length > 1) extraNotesParts.push(`Additional emails: ${emailsFound.slice(1).join(", ")}`);
    if (phonesFound.length > 1) extraNotesParts.push(`Additional numbers: ${phonesFound.slice(1).join(", ")}`);
    const existingNote = get("crm_note") || "";

    let mobile = (phonesFound[0] || "").replace(/^\+/, "");
    let countryCode = get("country_code") || "";
    if (mobile.length > 10) {
      const code = mobile.slice(0, mobile.length - 10);
      countryCode = countryCode || `+${code}`;
      mobile = mobile.slice(-10);
    } else if (!countryCode && mobile) {
      countryCode = "+91";
    }

    records.push({
      created_at: toIsoDate(get("created_at")),
      name: get("name") || "Unknown Lead",
      email: emailsFound[0] || "",
      country_code: countryCode || "+91",
      mobile_without_country_code: mobile,
      company: get("company") || "",
      city: get("city") || "",
      state: get("state") || "",
      country: get("country") || "",
      lead_owner: get("lead_owner") || "",
      crm_status: normalizeStatus(get("crm_status")),
      crm_note: [existingNote, ...extraNotesParts].filter(Boolean).join(" | "),
      data_source: normalizeSource(get("data_source")),
      possession_time: get("possession_time") || "",
      description: get("description") || "",
    });
  });

  return { records, skipped, headerMap };
}

module.exports = {
  buildHeaderMap,
  heuristicExtract,
  normalizeStatus,
  normalizeSource,
  ALLOWED_STATUS,
  ALLOWED_SOURCE,
};
