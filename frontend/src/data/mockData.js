export const SKILLS_DATA = {
  leetcode: {
    easy: 87,
    medium: 142,
    hard: 31,
    streak: 12,
    rank: 45230,
    totalSolved: 260,
  },
  github: {
    repos: 18,
    commits: 847,
    stars: 124,
    prs: 43,
    languages: ["Python", "JavaScript", "TypeScript", "Go"],
    streak: 22,
  },
  linkedin: {
    connections: 312,
    endorsements: {
      "Machine Learning": 24,
      Python: 31,
      React: 18,
      "Data Structures": 15,
    },
    views: 1240,
  },
  skills: [
    { name: "Data Structures & Algorithms", score: 72 },
    { name: "System Design", score: 45 },
    { name: "Frontend Development", score: 81 },
    { name: "Machine Learning", score: 63 },
    { name: "Database Design", score: 58 },
    { name: "DevOps / Cloud", score: 34 },
  ],
  gaps: [
    {
      area: "System Design",
      priority: "High",
      resources: [
        "Grokking the System Design Interview",
        "System Design Primer on GitHub",
      ],
    },
    {
      area: "DevOps / Cloud",
      priority: "High",
      resources: ["AWS Cloud Practitioner", "Docker Getting Started"],
    },
    {
      area: "Database Design",
      priority: "Medium",
      resources: ["CMU 15-445 Database Systems", "SQL Murder Mystery"],
    },
  ],
};

export const SKILL_COLORS = [
  "var(--indigo)",
  "var(--cyan)",
  "var(--green)",
  "var(--amber)",
  "#EC4899",
  "#F97316",
];
