const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { extractTextFromFile } = require("../services/extractResume");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/resume", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const text = await extractTextFromFile(req.file.path, req.file.mimetype);
    fs.unlinkSync(req.file.path); // clean up temp file
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;