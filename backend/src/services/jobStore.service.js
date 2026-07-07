const { v4: uuidv4 } = require("uuid");

/**
 * Very small in-memory job registry. A "job" holds the parsed CSV rows for a
 * short window between the client confirming import and the SSE stream
 * connecting, so we can stream batch-by-batch progress (bonus: streaming /
 * incremental parsing + progress indicators) without needing POST-with-body
 * support in EventSource.
 */
const jobs = new Map();
const JOB_TTL_MS = 15 * 60 * 1000;

function createJob({ rows, headers, userId }) {
  const id = uuidv4();
  jobs.set(id, {
    id,
    rows,
    headers,
    userId,
    status: "pending",
    createdAt: Date.now(),
  });
  setTimeout(() => jobs.delete(id), JOB_TTL_MS);
  return id;
}

function getJob(id) {
  return jobs.get(id);
}

function updateJob(id, patch) {
  const job = jobs.get(id);
  if (!job) return null;
  Object.assign(job, patch);
  return job;
}

function deleteJob(id) {
  jobs.delete(id);
}

module.exports = { createJob, getJob, updateJob, deleteJob };
