const express = require("express");
const authRoutes = require("./auth.routes");
const csvRoutes = require("./csv.routes");
const leadsRoutes = require("./leads.routes");

const router = express.Router();

router.get("/health", (req, res) => res.json({ success: true, status: "ok", time: new Date().toISOString() }));
router.use("/auth", authRoutes);
router.use("/csv", csvRoutes);
router.use("/leads", leadsRoutes);

module.exports = router;
