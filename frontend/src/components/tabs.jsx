import { Ring, MiniBar, MetricCard } from "./ui.jsx";
import { SKILLS_DATA, SKILL_COLORS } from "../data/mockData.js";

export function OverviewTab({ profile, onTabChange, leetcodeStats, leetcodeError, githubStats, githubError }) {
  const problemsSolved = leetcodeStats ? leetcodeStats.totalSolved : "—";
  const leetcodeRank = leetcodeStats?.ranking
    ? leetcodeStats.ranking >= 1000
      ? `#${Math.round(leetcodeStats.ranking / 1000)}K`
      : `#${leetcodeStats.ranking}`
    : "—";
  const githubCommits = githubStats ? githubStats.totalCommits : "—";

  return (
    <div className="fadein">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text1)" }}>
          Welcome back, {(profile.name || "").split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text3)", fontSize: "14px", marginTop: 4 }}>
          {profile.degree} · {profile.college} · {profile.year}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {[
          // Real, from your LeetCode and GitHub routes
          { label: "Problems Solved", val: problemsSolved, icon: "💡", color: "var(--indigo)" },
          { label: "LeetCode Rank",   val: leetcodeRank,   icon: "🏅", color: "var(--amber)" },
          { label: "GitHub Commits",  val: githubCommits,  icon: "🐙", color: "var(--cyan)" },
          // Still mock — no skill-scoring backend yet
          { label: "Skill Score",     val: "59%", icon: "📈", color: "var(--green)" },
        ].map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ borderColor: "var(--border2)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text1)", marginBottom: 16 }}>
            Skill Breakdown
          </h3>
          {SKILLS_DATA.skills.map((s, i) => (
            <div key={s.name} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "var(--text2)" }}>{s.name}</span>
                <span style={{ color: SKILL_COLORS[i], fontWeight: 600 }}>{s.score}%</span>
              </div>
              <MiniBar val={s.score} max={100} color={SKILL_COLORS[i]} />
            </div>
          ))}
        </div>

        <div className="card" style={{ borderColor: "var(--border2)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text1)", marginBottom: 16 }}>
            Top Skill Gaps to Fix
          </h3>
          {SKILLS_DATA.gaps.map((g) => (
            <div
              key={g.area}
              style={{
                marginBottom: 14,
                padding: "12px",
                background: "var(--slate)",
                borderRadius: 8,
                borderLeft: `3px solid ${g.priority === "High" ? "var(--red)" : "var(--amber)"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text1)" }}>
                  {g.area}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: 20,
                    background:
                      g.priority === "High"
                        ? "rgba(239,68,68,.15)"
                        : "rgba(245,158,11,.15)",
                    color: g.priority === "High" ? "var(--red)" : "var(--amber)",
                  }}
                >
                  {g.priority}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text3)" }}>{g.resources[0]}</p>
            </div>
          ))}
          <button
            className="btn-secondary"
            style={{ width: "100%", marginTop: 8, justifyContent: "center", fontSize: "13px" }}
            onClick={() => onTabChange("gaps")}
          >
            View all gaps →
          </button>
        </div>
      </div>

      <div className="card" style={{ borderColor: "var(--border2)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text1)", marginBottom: 4 }}>
          Linked Profiles
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: 16 }}>
          Data sources for your skill analysis
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "GitHub",   url: profile.github,      icon: "🐙", status: !!profile.github },
            { label: "LeetCode", url: profile.leetcode,    icon: "💻", status: !!profile.leetcode },
            { label: "Resume",   url: profile.resumeName,  icon: "📄", status: !!profile.resumeName },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: p.status ? "var(--slate)" : "var(--navy3)",
                borderRadius: 8,
                border: `1px solid ${p.status ? "var(--border2)" : "var(--border)"}`,
                fontSize: "13px",
              }}
            >
              <span>{p.icon}</span>
              <span style={{ color: p.status ? "var(--text1)" : "var(--text3)" }}>
                {p.label}
              </span>
              <span style={{ fontSize: 10, color: p.status ? "var(--green)" : "var(--text3)" }}>
                {p.status ? "●" : "○"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeetCodeTab({ profile, stats, error }) {
  if (!profile.leetcode) {
    return (
      <div className="fadein">
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
          💻 LeetCode Stats
        </h1>
        <p style={{ color: "var(--text3)", fontSize: "13px" }}>
          No LeetCode profile linked yet. Add one from your profile settings to see stats here.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fadein">
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
          💻 LeetCode Stats
        </h1>
        <p style={{ color: "var(--text3)", fontSize: "13px", marginBottom: 16 }}>
          {profile.leetcode}
        </p>
        <div
          style={{
            padding: "12px",
            background: "rgba(239,68,68,.08)",
            borderRadius: 8,
            border: "1px solid rgba(239,68,68,.2)",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--red)" }}>{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="fadein">
        <div className="spinner" />
      </div>
    );
  }

  const { totalSolved, easySolved, mediumSolved, hardSolved, ranking, recentSubmissions } = stats;
  // Approximate caps of LeetCode's overall question bank per difficulty, so bars
  // read as "progress toward everything available" rather than an arbitrary number.
  const CAPS = { easy: 850, medium: 1800, hard: 800 };

  return (
    <div className="fadein">
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
        💻 LeetCode Stats
      </h1>
      <p style={{ color: "var(--text3)", fontSize: "13px", marginBottom: 24 }}>
        {profile.leetcode}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Total Solved", val: totalSolved,  color: "var(--indigo)" },
          { label: "Easy",         val: easySolved,   color: "var(--green)" },
          { label: "Medium",       val: mediumSolved, color: "var(--amber)" },
          { label: "Hard",         val: hardSolved,   color: "var(--red)" },
        ].map((m) => (
          <div key={m.label} className="metric-card">
            <div style={{ fontSize: "26px", fontWeight: 700, color: m.color }}>{m.val}</div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ borderColor: "var(--border2)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: 16 }}>
            Problem Distribution
          </h3>
          {[
            { label: "Easy",   val: easySolved,   max: CAPS.easy,   color: "var(--green)" },
            { label: "Medium", val: mediumSolved,  max: CAPS.medium, color: "var(--amber)" },
            { label: "Hard",   val: hardSolved,    max: CAPS.hard,   color: "var(--red)" },
          ].map((d) => (
            <div key={d.label} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "var(--text2)" }}>{d.label}</span>
                <span style={{ color: d.color, fontWeight: 600 }}>{d.val}</span>
              </div>
              <MiniBar val={d.val} max={d.max} color={d.color} />
            </div>
          ))}
          <div style={{ marginTop: 16, padding: "10px", background: "var(--slate)", borderRadius: 8 }}>
            <div style={{ fontSize: "12px", color: "var(--text3)" }}>Global Rank</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--indigo)", marginTop: 2 }}>
              {ranking ? `#${ranking.toLocaleString()}` : "Unranked"}
            </div>
          </div>
        </div>

        <div className="card" style={{ borderColor: "var(--border2)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: 16 }}>
            Progress to 500
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <Ring
              percent={Math.min(100, Math.round((totalSolved / 500) * 100))}
              color="var(--indigo)"
              size={72}
            />
            <div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--indigo)" }}>
                {totalSolved}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text3)" }}>of 500 target</div>
            </div>
          </div>

          <div style={{ padding: "12px", background: "var(--slate)", borderRadius: 8 }}>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: 8 }}>
              Recent Submissions
            </div>
            {recentSubmissions?.length ? (
              recentSubmissions.slice(0, 4).map((s) => (
                <div
                  key={`${s.titleSlug}-${s.timestamp}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    padding: "6px 0",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <span style={{ color: "var(--text2)" }}>{s.title}</span>
                  <span
                    style={{
                      color: s.statusDisplay === "Accepted" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {s.statusDisplay}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: "12px", color: "var(--text3)" }}>No recent activity found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GitHubTab({ profile, stats, error }) {
  if (!profile.github) {
    return (
      <div className="fadein">
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
          🐙 GitHub Activity
        </h1>
        <p style={{ color: "var(--text3)", fontSize: "13px" }}>
          No GitHub profile linked yet. Add one from your profile settings to see stats here.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fadein">
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
          🐙 GitHub Activity
        </h1>
        <p style={{ color: "var(--text3)", fontSize: "13px", marginBottom: 16 }}>
          {profile.github}
        </p>
        <div
          style={{
            padding: "12px",
            background: "rgba(239,68,68,.08)",
            borderRadius: 8,
            border: "1px solid rgba(239,68,68,.2)",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--red)" }}>{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="fadein">
        <div className="spinner" />
      </div>
    );
  }

  const { ownRepoCount, collaboratedRepoCount, totalCommits, contributionsLastYear, topRepos, languageCounts } = stats;

  const totalLangCount = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1;
  const languagePcts = Object.entries(languageCounts)
    .map(([lang, count]) => ({ lang, pct: Math.round((count / totalLangCount) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);
  const LANG_COLORS = ["var(--indigo)", "var(--amber)", "var(--cyan)", "var(--green)"];

  return (
    <div className="fadein">
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
        🐙 GitHub Activity
      </h1>
      <p style={{ color: "var(--text3)", fontSize: "13px", marginBottom: 24 }}>
        {profile.github}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Own Repos",          val: ownRepoCount,           color: "var(--indigo)" },
          { label: "Contributed Repos",  val: collaboratedRepoCount,  color: "var(--green)" },
          { label: "Total Commits",      val: totalCommits,           color: "var(--cyan)" },
          { label: "Contributions (1y)", val: contributionsLastYear,  color: "var(--amber)" },
        ].map((m) => (
          <div key={m.label} className="metric-card">
            <div style={{ fontSize: "26px", fontWeight: 700, color: m.color }}>{m.val}</div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ borderColor: "var(--border2)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: 16 }}>Top Languages</h3>
          {languagePcts.length ? (
            languagePcts.map((l, i) => (
              <div key={l.lang} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: "var(--text2)" }}>{l.lang}</span>
                  <span style={{ color: LANG_COLORS[i], fontWeight: 600 }}>{l.pct}%</span>
                </div>
                <MiniBar val={l.pct} max={100} color={LANG_COLORS[i]} />
              </div>
            ))
          ) : (
            <div style={{ fontSize: "12px", color: "var(--text3)" }}>No language data available</div>
          )}
        </div>

        <div className="card" style={{ borderColor: "var(--border2)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: 16 }}>
            Top Repositories by Commits
          </h3>
          {topRepos.length ? (
            topRepos.map((r) => (
              <div key={`${r.owner}/${r.name}`} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: "var(--text2)" }}>
                    {r.isOwn ? r.name : `${r.owner}/${r.name}`}
                    {!r.isOwn && (
                      <span
                        style={{
                          fontSize: "10px",
                          marginLeft: 6,
                          padding: "1px 6px",
                          borderRadius: 20,
                          background: "rgba(16,185,129,.15)",
                          color: "var(--green)",
                        }}
                      >
                        contributor
                      </span>
                    )}
                  </span>
                  <span style={{ color: "var(--cyan)", fontWeight: 600 }}>{r.commits}</span>
                </div>
                <MiniBar
                  val={r.commits}
                  max={topRepos[0].commits || 1}
                  color="var(--cyan)"
                />
              </div>
            ))
          ) : (
            <div style={{ fontSize: "12px", color: "var(--text3)" }}>No repositories found</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SkillGapsTab({ profile }) {
  return (
    <div className="fadein">
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
        🎯 Skill Gap Analysis
      </h1>
      <p style={{ color: "var(--text3)", fontSize: "13px", marginBottom: 24 }}>
        Based on your target role:{" "}
        <span style={{ color: "var(--indigo2)", fontWeight: 600 }}>
          {profile.jobTarget || "Software Engineer"}
        </span>
      </p>

      <div style={{ marginBottom: 24 }}>
        {SKILLS_DATA.skills.map((s, i) => (
          <div key={s.name} className="card" style={{ borderColor: "var(--border2)", marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text1)" }}>
                  {s.name}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    marginLeft: 10,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background:
                      s.score >= 70
                        ? "rgba(16,185,129,.15)"
                        : s.score >= 50
                        ? "rgba(245,158,11,.15)"
                        : "rgba(239,68,68,.15)",
                    color:
                      s.score >= 70
                        ? "var(--green)"
                        : s.score >= 50
                        ? "var(--amber)"
                        : "var(--red)",
                  }}
                >
                  {s.score >= 70 ? "Strong" : s.score >= 50 ? "Developing" : "Gap"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Ring percent={s.score} color={SKILL_COLORS[i]} size={48} stroke={4} />
                <span style={{ fontSize: "18px", fontWeight: 700, color: SKILL_COLORS[i] }}>
                  {s.score}%
                </span>
              </div>
            </div>
            <MiniBar val={s.score} max={100} color={SKILL_COLORS[i]} />
            {s.score < 60 && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  background: "var(--slate)",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text3)" }}>💡 Recommended: </span>
                <span style={{ fontSize: "12px", color: "var(--text2)" }}>
                  {s.name === "System Design"
                    ? "Study Grokking the System Design Interview"
                    : s.name === "DevOps / Cloud"
                    ? "Take AWS Cloud Practitioner certification"
                    : s.name === "Database Design"
                    ? "Complete CMU 15-445 course"
                    : "Practice more problems"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}