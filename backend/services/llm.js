const axios = require("axios");

async function extractSkillsFromText(resumeText) {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a resume parser. Extract information from the resume text and return ONLY a JSON object with no extra text, no markdown, no backticks. Just raw JSON.`,
        },
        {
          role: "user",
          content: `Extract the following from this resume and return as JSON:
{
  "name": "full name",
  "college": "college or university name",
  "degree": "degree name",
  "year": "current year of study or graduation year",
  "cgpa": "cgpa or percentage if mentioned",
  "skills": ["skill1", "skill2", "skill3"]
}

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
    }
  );

  const content = response.data.choices[0].message.content;
  const parsed = JSON.parse(content);
  return parsed;
}

module.exports = { extractSkillsFromText };