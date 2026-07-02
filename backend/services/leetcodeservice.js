const axios = require("axios");

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql/";

/**
 * Accepts a plain username or a full profile URL/anchor text and
 * returns just the username LeetCode expects in queries.
 * Handles both old-style https://leetcode.com/username/
 * and new-style https://leetcode.com/u/username/
 */
function extractLeetcodeUsername(input) {
  if (!input) return null;
  const trimmed = input.trim();

  // Already a bare username (no slashes, no dots)
  if (!/[\/.]/.test(trimmed)) return trimmed;

  try {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const { pathname } = new URL(url);
    const parts = pathname.split("/").filter(Boolean); // drop empty segments
    // ["u", "username"] or ["username"]
    return parts[0] === "u" ? parts[1] : parts[0];
  } catch {
    return null;
  }
}

const PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        reputation
        realName
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    recentSubmissionList(username: $username, limit: 5) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

async function fetchLeetCodeStats(usernameOrUrl) {
  const username = extractLeetcodeUsername(usernameOrUrl);
  if (!username) {
    throw new Error("Could not extract a LeetCode username from the provided value");
  }

  let response;
  try {
    response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query: PROFILE_QUERY,
        variables: { username },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/${username}/`,
          Origin: "https://leetcode.com",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 10000,
      }
    );
  } catch (err) {
    // Surface the real failure (403, timeout, DNS, etc.) instead of a generic message
    const status = err.response?.status;
    const body = err.response?.data;
    throw new Error(
      `LeetCode request failed${status ? ` (HTTP ${status})` : ""}: ${
        typeof body === "string" ? body.slice(0, 300) : err.message
      }`
    );
  }

  const { data, errors } = response.data;
  if (errors?.length) {
    throw new Error(`LeetCode API error: ${errors[0].message}`);
  }
  if (!data?.matchedUser) {
    throw new Error(`No LeetCode user found for username "${username}"`);
  }

  const acStats = data.matchedUser.submitStats.acSubmissionNum;
  const byDifficulty = Object.fromEntries(
    acStats.map((s) => [s.difficulty.toLowerCase(), s.count])
  );

  return {
    username: data.matchedUser.username,
    ranking: data.matchedUser.profile.ranking,
    reputation: data.matchedUser.profile.reputation,
    totalSolved: byDifficulty.all || 0,
    easySolved: byDifficulty.easy || 0,
    mediumSolved: byDifficulty.medium || 0,
    hardSolved: byDifficulty.hard || 0,
    recentSubmissions: data.recentSubmissionList,
  };
}

module.exports = { fetchLeetCodeStats, extractLeetcodeUsername };