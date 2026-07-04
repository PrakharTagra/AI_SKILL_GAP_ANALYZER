const express = require("express");
const router = express.Router();
const { analyzeSkillGap } = require("../services/embeddings");
const rolesSkills = require("../data/rolesSkills.json");

router.post("/analyze", async (req, res) => {
  const { skills, jobTarget } = req.body;

  if (!skills || !jobTarget) {
    return res.status(400).json({ error: "skills and jobTarget are required" });
  }

  // Convert skills string to array if needed
  const userSkills = Array.isArray(skills)
    ? skills
    : skills.split(",").map((s) => s.trim()).filter(Boolean);

  // Check if role exists in dataset
  let requiredSkills = rolesSkills[jobTarget];

  // If role not found, find closest roles using simple word matching
  if (!requiredSkills) {
    console.log(`Role "${jobTarget}" not found, finding similar roles...`);
    const similarRoles = Object.keys(rolesSkills).filter((role) =>
      role.toLowerCase().split(" ").some((word) =>
        jobTarget.toLowerCase().includes(word)
      )
    );

    if (similarRoles.length > 0) {
      // Merge skills from similar roles
      const mergedSkills = new Set();
      similarRoles.forEach((role) => {
        rolesSkills[role].forEach((skill) => mergedSkills.add(skill));
      });
      requiredSkills = Array.from(mergedSkills);
      console.log(`Using similar roles: ${similarRoles.join(", ")}`);
    } else {
      return res.status(404).json({ error: `No matching role found for "${jobTarget}"` });
    }
  }

  try {
    console.log(`Analyzing gap for: ${jobTarget}`);
    console.log(`User skills: ${userSkills.join(", ")}`);
    console.log(`Required skills: ${requiredSkills.join(", ")}`);

    const gapResult = await analyzeSkillGap(userSkills, requiredSkills);

    res.json({
      jobTarget,
      userSkills,
      requiredSkills,
      ...gapResult,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;