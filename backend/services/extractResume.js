const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

async function extractTextFromFile(filePath, mimeType) {
  const buffer = fs.readFileSync(filePath);

  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}

async function extractLinksFromFile(filePath, mimeType) {
  if (mimeType === "application/pdf") {
    return extractPdfLinks(filePath);
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxLinks(filePath);
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}

async function extractPdfLinks(filePath) {
  // pdfjs-dist is ESM-only from v4+, so it must be dynamically imported
  // even inside a CommonJS file.
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const seen = new Set();
  const links = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const annotations = await page.getAnnotations();
    for (const ann of annotations) {
      if (ann.subtype === "Link" && ann.url && !seen.has(ann.url)) {
        seen.add(ann.url);
        links.push({ page: i, url: ann.url });
      }
    }
  }
  return links;
}

async function extractDocxLinks(filePath) {
  const buffer = fs.readFileSync(filePath);
  const { value: html } = await mammoth.convertToHtml({ buffer });

  const seen = new Set();
  const links = [];
  const hrefRegex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/g;

  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const url = match[1];
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!seen.has(url)) {
      seen.add(url);
      links.push({ text, url });
    }
  }
  return links;
}

module.exports = { extractTextFromFile, extractLinksFromFile };