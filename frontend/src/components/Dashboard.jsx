import { useEffect, useState } from "react";
import {
  OverviewTab,
  LeetCodeTab,
  GitHubTab,
  LinkedInTab,
  SkillGapsTab,
} from "./tabs.jsx";

const NAV = [
  { id: "overview", label: "Overview",    icon: "📊" },
  { id: "leetcode", label: "LeetCode",    icon: "💻" },
  { id: "github",   label: "GitHub",      icon: "🐙" },
  { id: "linkedin", label: "LinkedIn",    icon: "💼" },
  { id: "gaps",     label: "Skill Gaps",  icon: "🎯" },
];

const API_BASE = "http://localhost:5000";

export default function Dashboard({ profile, onEditProfile, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [analyzing, setAnalyzing] = useState(true);

  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [leetcodeError, setLeetcodeError] = useState(null);
  const [githubStats, setGithubStats] = useState(null);
  const [githubError, setGithubError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfiles() {
      const tasks = [];

      if (profile.leetcode) {
        tasks.push(
          fetch(`${API_BASE}/api/leetcode/stats?profile=${encodeURIComponent(profile.leetcode)}`)
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch LeetCode stats");
              return res.json();
            })
            .then((data) => {
              if (!cancelled) setLeetcodeStats(data);
            })
            .catch((err) => {
              console.error(err);
              if (!cancelled) setLeetcodeError(err.message);
            })
        );
      }

      if (profile.github) {
        tasks.push(
          fetch(`${API_BASE}/api/github/stats?profile=${encodeURIComponent(profile.github)}`)
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch GitHub stats");
              return res.json();
            })
            .then((data) => {
              if (!cancelled) setGithubStats(data);
            })
            .catch((err) => {
              console.error(err);
              if (!cancelled) setGithubError(err.message);
            })
        );
      }

      // LinkedIn fetch slots in here once that service/route exists —
      // push another task into the array above, same pattern.

      await Promise.all(tasks);
      if (!cancelled) setAnalyzing(false);
    }

    loadProfiles();
    return () => {
      cancelled = true;
    };
  }, [profile.leetcode, profile.github]);

  if (analyzing) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--navy)",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          className="spinner"
          style={{ width: 36, height: 36, borderWidth: 3 }}
        />
        <p
          style={{ color: "var(--text3)", fontSize: "14px" }}
          className="pulse"
        >
          Analyzing your profiles with AI...
        </p>
        <p style={{ color: "var(--text3)", fontSize: "12px" }}>
          Pulling data from LeetCode, GitHub &amp; LinkedIn
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          background: "var(--navy2)",
          borderRight: "1px solid var(--border)",
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 8px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: 28, height: 28,
              background: "var(--indigo)",
              borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}>
            SkillGap AI
          </span>
        </div>

        {/* User pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            background: "var(--slate)",
            borderRadius: 10,
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: 32, height: 32,
              borderRadius: "50%",
              background: "var(--indigo3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0,
            }}
          >
            {(profile.name || "U")[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text1)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile.name || "Student"}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text3)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile.year || "Student"}
            </p>
          </div>
        </div>

        {/* Nav links */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`sidebar-link${activeTab === n.id ? " active" : ""}`}
              onClick={() => setActiveTab(n.id)}
            >
              <span>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

        {/* Bottom actions */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <button className="sidebar-link" onClick={onEditProfile}>
            ✏️ Edit Profile
          </button>
          <button
            className="sidebar-link"
            onClick={onLogout}
            style={{ color: "var(--red)" }}
          >
            🚪 Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          padding: "28px",
          overflowY: "auto",
          maxHeight: "100vh",
        }}
      >
        {activeTab === "overview" && (
          <OverviewTab
            profile={profile}
            onTabChange={setActiveTab}
            leetcodeStats={leetcodeStats}
            leetcodeError={leetcodeError}
            githubStats={githubStats}
            githubError={githubError}
          />
        )}
        {activeTab === "leetcode" && (
          <LeetCodeTab
            profile={profile}
            stats={leetcodeStats}
            error={leetcodeError}
          />
        )}
        {activeTab === "github" && (
          <GitHubTab
            profile={profile}
            stats={githubStats}
            error={githubError}
          />
        )}
        {activeTab === "linkedin" && <LinkedInTab  profile={profile} />}
        {activeTab === "gaps"     && <SkillGapsTab profile={profile} />}
      </div>
    </div>
  );
}