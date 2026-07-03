const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// Read CSV
const csvPath = path.join(__dirname, "data", "ai_jobs_market_2025_2026.csv");
const csvContent = fs.readFileSync(csvPath, "utf-8");

// Parse CSV
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

// Build roles → skills map
const rolesSkills = {};

for (const record of records) {
  const role = record.job_title?.trim();
  const skillsRaw = record.required_skills?.trim();

  if (!role || !skillsRaw) continue;

  // skills are pipe separated: "Python|PyTorch|MLOps"
  const skills = skillsRaw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!rolesSkills[role]) {
    rolesSkills[role] = new Set();
  }

  for (const skill of skills) {
    rolesSkills[role].add(skill);
  }
}

// Convert Sets to arrays
const result = {};
for (const [role, skillSet] of Object.entries(rolesSkills)) {
  result[role] = Array.from(skillSet);
}

// Save to data/rolesSkills.json
const outputPath = path.join(__dirname, "data", "rolesSkills.json");
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

console.log(`✅ Done! Generated ${Object.keys(result).length} roles`);
console.log("Roles found:");
Object.keys(result).forEach((role) => {
  console.log(`  - ${role}: ${result[role].length} unique skills`);
});