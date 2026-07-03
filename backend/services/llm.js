const axios = require("axios");

async function extractSkillsFromText(resumeText, extractedLinks = []) {
  // Give the model the real URLs we already pulled from PDF/DOCX annotations,
  // instead of hoping it can guess them from bare anchor text like "Github".
  const linksBlock = extractedLinks.length
    ? extractedLinks
        .map((l) => `${l.text || "link"}: ${l.url}`)
        .join("\n")
    : "None found";

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }, // forces valid JSON, no markdown fences
      messages: [
        {
          role: "system",
          content: `You are a resume parser. Extract information from the resume text and return ONLY a JSON object with no extra text, no markdown, no backticks. Just raw JSON. Use the provided "Extracted hyperlinks" list as the source of truth for profile URLs — do not guess or invent a URL that isn't in that list.`,
        },
        {
          role: "user",
          content: `Extract the following from this resume and return as JSON:
          {
            "name": "full name",
            "college": "college or university name",
            "degree": "degree name",
            "year": "current year of study if mentioned",
            "cgpa": "cgpa or percentage if mentioned",
            "skills": ["skill1", "skill2", "skill3"],
            "leetcode": "Leetcode profile URL from the extracted hyperlinks list, or empty string if not present",
            "github": "Github profile URL from the extracted hyperlinks list, or empty string if not present"
          }

          Extracted hyperlinks (ground truth for the URL fields above):
          ${linksBlock}

          Resume text:
          ${resumeText}`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  const content = response.data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`LLM returned invalid JSON: ${content.slice(0, 200)}`);
  }
}

module.exports = { extractSkillsFromText };