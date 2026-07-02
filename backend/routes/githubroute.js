const express = require("express");
const { fetchGithubStats } = require("../services/githubService");

const router = express.Router();

// GET /api/github/stats?profile=<username-or-url>
router.get("/stats", async (req, res) => {
  const { profile } = req.query;
  if (!profile) {
    return res.status(400).json({ error: "Missing 'profile' query param" });
  }

  try {
    const stats = await fetchGithubStats(profile);
    res.json(stats);
  } catch (err) {
    console.error("GitHub fetch failed:", err.message);
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;