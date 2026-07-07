const express = require("express");
const { signup, login, me, updateProfile } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.put("/update", requireAuth, updateProfile);

module.exports = router;
