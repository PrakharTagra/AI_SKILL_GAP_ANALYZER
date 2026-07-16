const axios = require("axios");
require("dotenv").config();
console.log("Token present:", !!process.env.GITHUB_TOKEN);
console.log("Token length:", process.env.GITHUB_TOKEN?.length);
console.log("Token starts with:", process.env.GITHUB_TOKEN?.slice(0, 4));

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour, per the doc's own caching recommendation
const CACHE_SCHEMA_VERSION = "v2"; // bump this whenever the returned shape changes
const cache = new Map(); // `${username}:${CACHE_SCHEMA_VERSION}` -> { data, expiresAt }

function extractGithubUsername(input) {
  if (!input) return null;
  const trimmed = input.trim();
  if (!/[\/.]/.test(trimmed)) return trimmed;

  try {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const { pathname } = new URL(url);
    const parts = pathname.split("/").filter(Boolean);
    return parts[0] || null;
  } catch {
    return null;
  }
}

async function githubGraphQL(query, variables) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set on the server");
  }

  const response = await axios.post(
    GITHUB_GRAPHQL_URL,
    { query, variables },
    {
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  const { data, errors } = response.data;
  if (errors?.length) {
    throw new Error(`GitHub API error: ${errors[0].message}`);
  }
  return data;
}

const STATS_QUERY = `
  query($login: String!, $authorId: ID!) {
    user(login: $login) {
      login
      avatarUrl
      followers { totalCount }
      following { totalCount }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
        totalCount
        nodes {
          name
          stargazerCount
          forkCount
          primaryLanguage { name }
          defaultBranchRef {
            target {
              ... on Commit {
                history(author: { id: $authorId }) {
                  totalCount
                }
              }
            }
          }
        }
      }
      repositoriesContributedTo(
        first: 50
        contributionTypes: [COMMIT]
        includeUserRepositories: false
        privacy: PUBLIC
      ) {
        totalCount
        nodes {
          name
          owner { login }
          stargazerCount
          forkCount
          primaryLanguage { name }
          defaultBranchRef {
            target {
              ... on Commit {
                history(author: { id: $authorId }) {
                  totalCount
                }
              }
            }
          }
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`;

async function fetchGithubStats(usernameOrUrl) {
  const username = extractGithubUsername(usernameOrUrl);
  if (!username) {
    throw new Error("Could not extract a GitHub username from the provided value");
  }

  const cacheKey = `${username}:${CACHE_SCHEMA_VERSION}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // Step 1: resolve the user's node ID — required to filter commit history
  // by author, which is what makes the totalCount below exact rather than
  // an estimate based on the git email used locally.
  const idData = await githubGraphQL(`query($login: String!) { user(login: $login) { id } }`, {
    login: username,
  });
  const authorId = idData.user?.id;
  if (!authorId) {
    throw new Error(`No GitHub user found for "${username}"`);
  }

  // Step 2: one query returns repos, per-repo exact commit counts, and
  // contribution calendar totals — no per-repository REST looping.
  const data = await githubGraphQL(STATS_QUERY, { login: username, authorId });
  const user = data.user;
  if (!user) {
    throw new Error(`No GitHub user found for "${username}"`);
  }

  const ownRepos = user.repositories.nodes.map((r) => ({
    name: r.name,
    owner: user.login,
    isOwn: true,
    stars: r.stargazerCount,
    forks: r.forkCount,
    language: r.primaryLanguage?.name || null,
    commits: r.defaultBranchRef?.target?.history?.totalCount ?? 0,
  }));

  const collaboratedRepos = user.repositoriesContributedTo.nodes.map((r) => ({
    name: r.name,
    owner: r.owner.login,
    isOwn: false,
    stars: r.stargazerCount,
    forks: r.forkCount,
    language: r.primaryLanguage?.name || null,
    commits: r.defaultBranchRef?.target?.history?.totalCount ?? 0,
  }));

  const allRepos = [...ownRepos, ...collaboratedRepos];
  const ownCommits = ownRepos.reduce((sum, r) => sum + r.commits, 0);
  const collaboratedCommits = collaboratedRepos.reduce((sum, r) => sum + r.commits, 0);
  const totalCommits = ownCommits + collaboratedCommits;
  const topRepos = [...allRepos].sort((a, b) => b.commits - a.commits).slice(0, 6);

  const languageCounts = {};
  for (const r of allRepos) {
    if (r.language) languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
  }

  const result = {
    username: user.login,
    avatarUrl: user.avatarUrl,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    ownRepoCount: user.repositories.totalCount,
    collaboratedRepoCount: user.repositoriesContributedTo.totalCount,
    totalCommits,
    ownCommits,
    collaboratedCommits,
    contributionsLastYear: user.contributionsCollection.contributionCalendar.totalContributions,
    topRepos,
    languageCounts,
  };

  cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

module.exports = { fetchGithubStats, extractGithubUsername };