const express = require("express");
const { fetchLeetCodeStats } = require("../services/leetcodeService");

const router = express.Router();

// GET /api/leetcode/stats?profile=<username-or-url>
router.get("/stats", async (req, res) => {
  const { profile } = req.query;
  if (!profile) {
    return res.status(400).json({ error: "Missing 'profile' query param" });
  }

  try {
    const stats = await fetchLeetCodeStats(profile);
    res.json(stats);
  } catch (err) {
    console.error("LeetCode fetch failed:", err.message);
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;