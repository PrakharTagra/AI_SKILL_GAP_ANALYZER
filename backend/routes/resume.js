const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { extractTextFromFile } = require("../services/extractResume");
const { extractSkillsFromText } = require("../services/llm");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/resume", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Step 1: extract raw text from PDF/DOCX
    const text = await extractTextFromFile(req.file.path, req.file.mimetype);
    fs.unlinkSync(req.file.path); // clean up temp file

    // Step 2: send raw text to Grok, get structured data back
    const structured = await extractSkillsFromText(text);

    res.json(structured);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;