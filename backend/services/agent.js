const { searchResourcesForSkill } = require("./webSearch");
const axios = require("axios");

// Step 1 — Groq decides priority order of missing skills
async function prioritizeSkills(missingSkills, partialSkills, targetRole) {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a career coach AI. Return ONLY a JSON array, no extra text, no markdown.`,
        },
        {
          role: "user",
          content: `Target role: ${targetRole}
Missing skills: ${missingSkills.map((s) => s.required).join(", ")}
Partial skills: ${partialSkills.map((s) => `${s.required} (user has ${s.userHas})`).join(", ")}

Return a JSON array of skills in the order the user should learn them (most foundational first).
Each item should have: skill, reason, estimatedWeeks
Example: [{"skill": "Statistics", "reason": "foundational for ML", "estimatedWeeks": 3}]`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data.choices[0].message.content;
  const clean = content.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// Step 2 — Groq curates search results for each skill
async function curateResources(skill, searchResults) {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a learning resource curator. Return ONLY a JSON array, no extra text, no markdown.`,
        },
        {
          role: "user",
          content: `Skill to learn: ${skill}
Search results:
${searchResults.map((r, i) => `${i + 1}. ${r.title} - ${r.url}\n${r.summary}`).join("\n\n")}

Pick the best 2-3 resources and return as JSON array.
Each item: {"title": "...", "url": "...", "type": "course/article/video/documentation", "why": "one line reason"}`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data.choices[0].message.content;
  const clean = content.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// Main agent loop
async function runLearningPathAgent(missingSkills, partialSkills, targetRole) {
  console.log("🤖 Agent starting...");

  // STEP 1 — Agent prioritizes skills
  console.log("🧠 Agent thinking: prioritizing skills...");
  const prioritized = await prioritizeSkills(missingSkills, partialSkills, targetRole);
  console.log(`📋 Priority order: ${prioritized.map((s) => s.skill).join(" → ")}`);

  // STEP 2 — Agent loops through each skill
  const learningPath = [];

  for (const item of prioritized) {
    console.log(`🔍 Agent searching resources for: ${item.skill}`);

    // Agent uses web search tool
    const searchResults = await searchResourcesForSkill(item.skill);

    let resources = [];
    if (searchResults.length > 0) {
      // Agent curates results
      console.log(`✂️  Agent curating ${searchResults.length} results for: ${item.skill}`);
      resources = await curateResources(item.skill, searchResults);
    } else {
      // Agent retries with different query if no results
      console.log(`⚠️  No results, agent retrying for: ${item.skill}`);
      const retryResults = await searchResourcesForSkill(`${item.skill} tutorial beginners`);
      if (retryResults.length > 0) {
        resources = await curateResources(item.skill, retryResults);
      }
    }

    learningPath.push({
      skill: item.skill,
      reason: item.reason,
      estimatedWeeks: item.estimatedWeeks,
      resources,
      status: "not_started",
    });
  }

  console.log("✅ Agent done! Learning path generated.");
  return learningPath;
}

module.exports = { runLearningPathAgent };