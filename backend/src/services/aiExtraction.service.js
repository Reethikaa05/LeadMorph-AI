const OpenAI = require("openai");
const { heuristicExtract, ALLOWED_STATUS, ALLOWED_SOURCE } = require("../utils/matchers");

const BATCH_SIZE = parseInt(process.env.AI_BATCH_SIZE || "20", 10);
const MAX_RETRIES = parseInt(process.env.AI_MAX_RETRIES || "3", 10);
const CONCURRENCY = parseInt(process.env.AI_CONCURRENCY || "3", 10);

let client = null;
let provider = null;

function getClient() {
  if (process.env.GEMINI_API_KEY) {
    if (!client || provider !== "gemini") {
      client = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
      });
      provider = "gemini";
    }
    return client;
  }
  if (process.env.OPENAI_API_KEY) {
    if (!client || provider !== "openai") {
      client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      provider = "openai";
    }
    return client;
  }
  return null;
}

function getProvider() {
  return provider;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const SYSTEM_PROMPT = `You are a meticulous data-migration engine for "GrowEasy CRM".
You receive raw CSV lead rows (from Facebook Lead Ads, Google Ads, real-estate CRMs, sales
reports, or manually created spreadsheets) with UNPREDICTABLE column names, and you must map
them into the fixed GrowEasy CRM schema below.

CRM SCHEMA (return exactly these keys per record, use "" for unknown text fields):
- created_at: lead creation date-time, MUST be parseable by JavaScript's "new Date(value)".
  Prefer format "YYYY-MM-DD HH:mm:ss". If no date exists in the row, use the batch reference
  timestamp provided to you.
- name: the lead's full name.
- email: the PRIMARY email address only.
- country_code: phone country code including "+", e.g. "+91". Infer "+91" if the numbers look
  like Indian mobile numbers and no explicit code is present.
- mobile_without_country_code: the PRIMARY phone number, digits only, without the country code.
- company: company / organisation name if present.
- city, state, country: location fields if present or inferable.
- lead_owner: sales rep / agent / "assigned to" if present.
- crm_status: MUST be exactly one of ${ALLOWED_STATUS.join(", ")} or "" if nothing matches.
- crm_note: remarks, follow-up notes, extra comments, PLUS any additional email addresses or
  phone numbers beyond the primary one (e.g. "Additional email: x@y.com; Additional phone: 999...").
- data_source: MUST be exactly one of ${ALLOWED_SOURCE.join(", ")} or "" if nothing matches confidently.
- possession_time: property possession timeframe if present (real-estate leads).
- description: any additional free-text description/enquiry details that doesn't fit elsewhere.

RULES:
1. If a row has NEITHER an email NOR a phone number anywhere in its columns, SKIP the row
   entirely (do not include it in "records"; instead add it to "skipped" with the original
   row index and a short reason).
2. Never invent data. Leave a field "" if you cannot find or confidently infer it.
3. Keep every record a single flat JSON object - no nested objects, no arrays, no newlines
   inside string values (use " | " instead of line breaks).
4. Respond with STRICT JSON only, matching this shape and nothing else (no markdown fences,
   no commentary):
{
  "records": [ { ...CRM fields... } ],
  "skipped": [ { "row": <original 1-based index within this batch>, "reason": "<short reason>" } ]
}`;

function buildUserPrompt(rows, headers, batchStartIndex) {
  return `CSV headers in this file: ${JSON.stringify(headers)}
Reference timestamp for missing dates: ${new Date().toISOString().slice(0, 19).replace("T", " ")}
Batch rows (1-based index is local to this batch, starting at 1):
${JSON.stringify(rows.map((r, i) => ({ row: i + 1, data: r })), null, 0)}

Return ONLY the JSON object described in the system prompt.`;
}

function safeJsonParse(text) {
  const cleaned = text
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned);
}

async function callAiBatch(rows, headers) {
  const ai = getClient();
  const activeProvider = getProvider();
  const model = activeProvider === "gemini"
    ? (process.env.GEMINI_MODEL || "gemini-2.5-flash")
    : (process.env.OPENAI_MODEL || "gpt-4o-mini");

  const completion = await ai.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(rows, headers) },
    ],
  });

  const text = completion.choices?.[0]?.message?.content || "{}";
  const parsed = safeJsonParse(text);
  return {
    records: Array.isArray(parsed.records) ? parsed.records : [],
    skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
  };
}

async function withRetries(fn, retries = MAX_RETRIES) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const backoff = 300 * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}

async function processInPool(items, worker, concurrency = CONCURRENCY) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runNext() {
    while (cursor < items.length) {
      const current = cursor++;
      results[current] = await worker(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, runNext);
  await Promise.all(workers);
  return results;
}

/**
 * Extract CRM records from raw CSV rows using OpenAI (if configured), with
 * automatic retries per batch and a deterministic heuristic fallback so the
 * feature always produces a usable result.
 *
 * @param {object} params
 * @param {object[]} params.rows raw CSV row objects
 * @param {string[]} params.headers original CSV headers
 * @param {(progress: object) => void} [params.onProgress] streaming callback
 */
async function extractCrmRecords({ rows, headers, onProgress }) {
  const batches = chunk(rows, BATCH_SIZE);
  const usingAi = Boolean(getClient());
  const allRecords = [];
  const allSkipped = [];
  let completedBatches = 0;

  await processInPool(batches, async (batch, batchIndex) => {
    const globalOffset = batchIndex * BATCH_SIZE;
    let result;
    let usedFallback = false;
    let batchError = null;

    if (usingAi) {
      try {
        result = await withRetries(() => callAiBatch(batch, headers));
      } catch (err) {
        batchError = err.message;
        result = heuristicExtract(batch, headers);
        usedFallback = true;
      }
    } else {
      result = heuristicExtract(batch, headers);
      usedFallback = true;
    }

    allRecords.push(...result.records);
    allSkipped.push(
      ...result.skipped.map((s) => ({
        row: (s.row || 0) + globalOffset,
        reason: s.reason || "Skipped",
      }))
    );

    completedBatches += 1;
    if (onProgress) {
      onProgress({
        type: "progress",
        batch: batchIndex + 1,
        totalBatches: batches.length,
        completedBatches,
        usedFallback,
        batchError,
        importedSoFar: allRecords.length,
        skippedSoFar: allSkipped.length,
      });
    }
  });

  return {
    records: allRecords,
    skipped: allSkipped,
    meta: {
      totalRows: rows.length,
      totalImported: allRecords.length,
      totalSkipped: allSkipped.length,
      totalBatches: batches.length,
      aiMode: usingAi ? getProvider() : "heuristic-fallback",
    },
  };
}

module.exports = { extractCrmRecords, BATCH_SIZE };
