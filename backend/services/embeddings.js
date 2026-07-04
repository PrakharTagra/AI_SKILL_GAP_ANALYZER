const { pipeline } = require("@xenova/transformers");

let embedder = null;

// Load model once, reuse for all requests
async function getEmbedder() {
  if (!embedder) {
    console.log("Loading embedding model... (first time only)");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Embedding model loaded ✓");
  }
  return embedder;
}

// Convert a single text to embedding vector
async function getEmbedding(text) {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

// Compare two texts — returns similarity score 0 to 1
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

// Main function — compares user skills vs required skills
async function analyzeSkillGap(userSkills, requiredSkills) {
  const hasSkills = [];
  const partialSkills = [];
  const missingSkills = [];

  // Get embeddings for all user skills once
  const userEmbeddings = await Promise.all(
    userSkills.map(async (skill) => ({
      skill,
      embedding: await getEmbedding(skill),
    }))
  );

  // For each required skill, find best match in user skills
  for (const reqSkill of requiredSkills) {
    const reqEmbedding = await getEmbedding(reqSkill);

    let bestMatch = null;
    let bestScore = 0;

    for (const { skill, embedding } of userEmbeddings) {
      const score = cosineSimilarity(reqEmbedding, embedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = skill;
      }
    }

    if (bestScore >= 0.85) {
      // User clearly has this skill
      hasSkills.push({
        required: reqSkill,
        userHas: bestMatch,
        similarity: Math.round(bestScore * 100),
      });
    } else if (bestScore >= 0.5) {
      // User partially has this skill
      partialSkills.push({
        required: reqSkill,
        userHas: bestMatch,
        similarity: Math.round(bestScore * 100),
        note: `You know ${bestMatch} which is related`,
      });
    } else {
      // User is missing this skill
      missingSkills.push({
        required: reqSkill,
        similarity: Math.round(bestScore * 100),
      });
    }
  }

  return { hasSkills, partialSkills, missingSkills };
}

module.exports = { analyzeSkillGap };