const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { listLeads, leadStats } = require("../controllers/leads.controller");

const router = express.Router();

router.get("/", requireAuth, listLeads);
router.get("/stats", requireAuth, leadStats);

module.exports = router;
