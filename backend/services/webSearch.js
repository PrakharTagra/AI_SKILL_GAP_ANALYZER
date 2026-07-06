const { tavily } = require("@tavily/core");

const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

async function searchResourcesForSkill(skill) {
  try {
    const response = await client.search(
      `best resources to learn ${skill} for AI engineers 2026`,
      {
        maxResults: 5,
        searchDepth: "basic",
      }
    );

    // Return clean results
    return response.results.map((r) => ({
      title: r.title,
      url: r.url,
      summary: r.content?.slice(0, 200),
    }));
  } catch (err) {
    console.error(`Search failed for skill "${skill}":`, err.message);
    return [];
  }
}

module.exports = { searchResourcesForSkill };