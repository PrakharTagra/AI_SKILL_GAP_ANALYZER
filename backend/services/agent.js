const { searchResourcesForSkill } = require("./webSearch");
const axios = require("axios");
const { ChatGroq } = require("@langchain/groq");
const { StateGraph, MessagesAnnotation } = require("@langchain/langgraph");
const { ToolNode, toolsCondition } = require("@langchain/langgraph/prebuilt");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

// ---------------------------------------------------------------------------
// Step 1 — Groq decides priority order of missing skills (unchanged)
// ---------------------------------------------------------------------------
async function prioritizeSkills(missingSkills, partialSkills, targetRole) {
  try {
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
  } catch (err) {
    console.error(
      "prioritizeSkills failed:",
      err.response?.status || err.message,
      err.response?.data || ""
    );
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Original standalone curator (kept as-is — used by the fallback path below)
// ---------------------------------------------------------------------------
async function curateResources(skill, searchResults) {
  try {
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
  } catch (err) {
    console.error(
      "curateResources failed:",
      err.response?.status || err.message,
      err.response?.data || ""
    );
    throw err;
  }
}

// ---------------------------------------------------------------------------
// NEW: LangGraph tools
// Key fix: never make the LLM pass big JSON blobs as tool arguments.
// search_resources stores results in memory keyed by skill; curate_resources
// only takes `skill` (a plain string) and looks the results up itself.
// ---------------------------------------------------------------------------
const lastSearchResults = {};

const searchTool = tool(
  async ({ skill, refinedQuery }) => {
    const results = await searchResourcesForSkill(refinedQuery || skill);
    lastSearchResults[skill] = results;
    return `Found ${results.length} results for "${skill}". Titles: ${results
      .map((r) => r.title)
      .join(", ")}. Call curate_resources with just the skill name to pick the best ones.`;
  },
  {
    name: "search_resources",
    description:
      "Search the web for learning resources for a given skill. Use refinedQuery to try a more specific search if the first attempt gave poor results.",
    schema: z.object({
      skill: z.string().describe("The skill to search resources for"),
      refinedQuery: z
        .string()
        .optional()
        .describe("A more specific/refined search query, if retrying"),
    }),
  }
);

const curateTool = tool(
  async ({ skill }) => {
    const searchResults = lastSearchResults[skill] || [];
    if (searchResults.length === 0) {
      return "No search results available for this skill. Call search_resources first.";
    }

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
    return content.replace(/```json|```/g, "").trim();
  },
  {
    name: "curate_resources",
    description:
      "Curate the previously searched results into the best 2-3 learning resources for a skill. Only call this AFTER search_resources for the same skill.",
    schema: z.object({
      skill: z
        .string()
        .describe(
          "The skill whose search results should be curated (must match the skill used in search_resources)"
        ),
    }),
  }
);

const tools = [searchTool, curateTool];
const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
}).bindTools(tools);

async function agentNode(state) {
  const response = await llm.invoke(state.messages);
  return { messages: [response] };
}

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", agentNode)
  .addNode("tools", new ToolNode(tools))
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", toolsCondition)
  .addEdge("tools", "agent");

const skillAgent = graph.compile();

// ---------------------------------------------------------------------------
// Main agent loop (structure unchanged) — inner logic now LangGraph-driven,
// with a fallback to the original manual search+curate flow if the agent
// call fails (e.g. tool_use_failed from the model).
// ---------------------------------------------------------------------------
async function runLearningPathAgent(missingSkills, partialSkills, targetRole) {
  console.log("🤖 Agent starting...");

  console.log("🧠 Agent thinking: prioritizing skills...");
  const prioritized = await prioritizeSkills(missingSkills, partialSkills, targetRole);
  console.log(`📋 Priority order: ${prioritized.map((s) => s.skill).join(" → ")}`);

  const learningPath = [];

  for (const item of prioritized) {
    console.log(`🔍 LangGraph agent working on: ${item.skill}`);

    let resources = [];

    try {
      const result = await skillAgent.invoke({
        messages: [
          {
            role: "system",
            content:
              "You find learning resources for a skill. Use search_resources to search, then curate_resources (passing just the skill name) to pick the best ones. If search results are poor, call search_resources again with a refinedQuery. Once curated, respond with ONLY the final JSON array from curate_resources, nothing else.",
          },
          { role: "user", content: `Skill: ${item.skill}` },
        ],
      });

      const lastMsg = result.messages[result.messages.length - 1];
      resources = JSON.parse(lastMsg.content.replace(/```json|```/g, "").trim());
    } catch (err) {
      console.error(
        `⚠️  LangGraph agent failed for "${item.skill}", falling back to manual search+curate:`,
        err.message
      );

      // Fallback: original manual flow, so one bad generation doesn't kill the whole run
      try {
        const searchResults = await searchResourcesForSkill(item.skill);
        if (searchResults.length > 0) {
          resources = await curateResources(item.skill, searchResults);
        } else {
          const retryResults = await searchResourcesForSkill(`${item.skill} tutorial beginners`);
          if (retryResults.length > 0) {
            resources = await curateResources(item.skill, retryResults);
          }
        }
      } catch (fallbackErr) {
        console.error(`❌ Fallback also failed for "${item.skill}":`, fallbackErr.message);
        resources = [];
      }
    }

    learningPath.push({
      skill: item.skill,
      reason: item.reason,
      estimatedWeeks: item.estimatedWeeks,
      resources,
      status: "not_started",
    });

    // Pace out Groq calls to avoid rate-limit bursts
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("✅ Agent done! Learning path generated.");
  return learningPath;
}

module.exports = { runLearningPathAgent };