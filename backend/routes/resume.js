const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { extractTextFromFile, extractLinksFromFile } = require("../services/extractResume");
const { extractSkillsFromText } = require("../services/llm");

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Unsupported file type. Please upload a PDF or DOCX file."));
  },
});

router.post("/resume", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const [text, links] = await Promise.all([
      extractTextFromFile(req.file.path, req.file.mimetype),
      extractLinksFromFile(req.file.path, req.file.mimetype),
    ]);

    const structured = await extractSkillsFromText(text, links);
    res.json(structured);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes("Unsupported file type")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;