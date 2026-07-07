const { parseCsvBuffer } = require("../services/csvParser.service");
const { extractCrmRecords } = require("../services/aiExtraction.service");
const { createJob, getJob, updateJob, deleteJob } = require("../services/jobStore.service");
const { JsonStore } = require("../utils/store");

const leadsStore = new JsonStore("leads", []);

/** POST /api/csv/upload - parse only, NO AI processing. */
function uploadCsv(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No CSV file was uploaded" });
    }

    const { headers, rows } = parseCsvBuffer(req.file.buffer);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "The CSV file appears to be empty" });
    }

    res.json({
      success: true,
      fileName: req.file.originalname,
      fileSizeKb: Math.round(req.file.size / 1024),
      headers,
      rowCount: rows.length,
      rows,
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/csv/process - confirm import, synchronous (non-streaming) response. */
async function processCsv(req, res, next) {
  try {
    const { rows, headers } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: "No rows provided for processing" });
    }

    const result = await extractCrmRecords({ rows, headers: headers || Object.keys(rows[0]) });

    leadsStore.pushMany(
      result.records.map((r) => ({ ...r, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, userId: req.user?.id || "anonymous" }))
    );

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

/** POST /api/csv/process-stream/start - registers a job and returns a jobId. */
function startStreamJob(req, res, next) {
  try {
    const { rows, headers } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: "No rows provided for processing" });
    }
    const jobId = createJob({ rows, headers: headers || Object.keys(rows[0]), userId: req.user?.id });
    res.json({ success: true, jobId });
  } catch (err) {
    next(err);
  }
}

/** GET /api/csv/process-stream/:jobId - Server-Sent Events progress stream. */
async function streamJob(req, res) {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ success: false, message: "Job not found or expired" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  updateJob(job.id, { status: "processing" });
  send("start", { totalRows: job.rows.length });

  try {
    const result = await extractCrmRecords({
      rows: job.rows,
      headers: job.headers,
      onProgress: (progress) => send("progress", progress),
    });

    leadsStore.pushMany(
      result.records.map((r) => ({
        ...r,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: job.userId || "anonymous",
      }))
    );

    send("done", result);
  } catch (err) {
    send("error", { message: err.message });
  } finally {
    deleteJob(job.id);
    res.end();
  }
}

module.exports = { uploadCsv, processCsv, startStreamJob, streamJob };
