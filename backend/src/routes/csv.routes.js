const express = require("express");
const { upload } = require("../middleware/upload");
const { requireAuth } = require("../middleware/auth");
const {
  uploadCsv,
  processCsv,
  startStreamJob,
  streamJob,
} = require("../controllers/csv.controller");

const router = express.Router();

// Step 1 & 2: upload + parse only, no AI yet
router.post("/upload", requireAuth, upload.single("file"), uploadCsv);

// Step 3 & 4: confirm import -> AI extraction (synchronous)
router.post("/process", requireAuth, processCsv);

// Streaming variant (bonus: progress indicators / incremental processing)
router.post("/process-stream/start", requireAuth, startStreamJob);
router.get("/process-stream/:jobId", streamJob); // EventSource can't send auth headers

module.exports = router;
