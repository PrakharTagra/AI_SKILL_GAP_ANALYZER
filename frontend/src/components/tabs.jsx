import { Ring, MiniBar, MetricCard } from "./ui.jsx";
import { SKILLS_DATA, SKILL_COLORS } from "../data/mockData.js";

export function OverviewTab({ profile, onTabChange }) {
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
          { label: "Problems Solved", val: "260", icon: "💡", color: "var(--indigo)" },
          { label: "GitHub Commits",  val: "847", icon: "🐙", color: "var(--cyan)" },
          { label: "LeetCode Rank",   val: "#45K", icon: "🏅", color: "var(--amber)" },
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
            { label: "LinkedIn", url: profile.linkedin,    icon: "💼", status: !!profile.linkedin },
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

export function LeetCodeTab({ profile }) {
  return (
    <div className="fadein">
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
        💻 LeetCode Stats
      </h1>
      <p style={{ color: "var(--text3)", fontSize: "13px", marginBottom: 24 }}>
        {profile.leetcode || "leetcode.com/user"}
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
          { label: "Total Solved", val: SKILLS_DATA.leetcode.totalSolved, color: "var(--indigo)" },
          { label: "Easy",         val: SKILLS_DATA.leetcode.easy,        color: "var(--green)" },
          { label: "Medium",       val: SKILLS_DATA.leetcode.medium,      color: "var(--amber)" },
          { label: "Hard",         val: SKILLS_DATA.leetcode.hard,        color: "var(--red)" },
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
            { label: "Easy",   val: 87,  max: 150, color: "var(--green)" },
            { label: "Medium", val: 142, max: 300, color: "var(--amber)" },
            { label: "Hard",   val: 31,  max: 100, color: "var(--red)" },
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
              #{SKILLS_DATA.leetcode.rank.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card" style={{ borderColor: "var(--border2)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: 16 }}>Consistency</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <Ring
              percent={Math.round((SKILLS_DATA.leetcode.totalSolved / 500) * 100)}
              color="var(--indigo)"
              size={72}
            />
            <div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--indigo)" }}>
                {SKILLS_DATA.leetcode.totalSolved}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text3)" }}>of 500 target</div>
            </div>
          </div>
          <div style={{ padding: "12px", background: "var(--slate)", borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: "12px", color: "var(--text3)" }}>Current Streak</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--amber)", marginTop: 2 }}>
              {SKILLS_DATA.leetcode.streak} 🔥 days
            </div>
          </div>
          <div
            style={{
              padding: "12px",
              background: "rgba(239,68,68,.08)",
              borderRadius: 8,
              border: "1px solid rgba(239,68,68,.2)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: 4 }}>
              Weakness detected
            </div>
            <div style={{ fontSize: "13px", color: "var(--red)" }}>
              Dynamic Programming — only 4 Hard solved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GitHubTab({ profile }) {
  return (
    <div className="fadein">
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
        🐙 GitHub Activity
      </h1>
      <p style={{ color: "var(--text3)", fontSize: "13px", marginBottom: 24 }}>
        {profile.github || "github.com/user"}
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
          { label: "Repositories", val: SKILLS_DATA.github.repos,   color: "var(--indigo)" },
          { label: "Total Commits", val: SKILLS_DATA.github.commits, color: "var(--cyan)" },
          { label: "Stars Earned",  val: SKILLS_DATA.github.stars,   color: "var(--amber)" },
          { label: "Pull Requests", val: SKILLS_DATA.github.prs,     color: "var(--green)" },
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
          {[
            { lang: "Python",     pct: 42, color: "var(--indigo)" },
            { lang: "JavaScript", pct: 28, color: "var(--amber)" },
            { lang: "TypeScript", pct: 18, color: "var(--cyan)" },
            { lang: "Go",         pct: 12, color: "var(--green)" },
          ].map((l) => (
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
                <span style={{ color: l.color, fontWeight: 600 }}>{l.pct}%</span>
              </div>
              <MiniBar val={l.pct} max={100} color={l.color} />
            </div>
          ))}
        </div>

        <div className="card" style={{ borderColor: "var(--border2)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: 16 }}>
            Contribution Insights
          </h3>
          <div style={{ padding: "12px", background: "var(--slate)", borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: "12px", color: "var(--text3)" }}>Current Streak</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--green)", marginTop: 2 }}>
              {SKILLS_DATA.github.streak} 🔥 days
            </div>
          </div>
          <div style={{ padding: "12px", background: "var(--slate)", borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: "12px", color: "var(--text3)" }}>Avg commits / week</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--cyan)", marginTop: 2 }}>
              16.3
            </div>
          </div>
          <div
            style={{
              padding: "12px",
              background: "rgba(16,185,129,.08)",
              borderRadius: 8,
              border: "1px solid rgba(16,185,129,.2)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: 4 }}>
              Strength detected
            </div>
            <div style={{ fontSize: "13px", color: "var(--green)" }}>
              Consistent daily contribution habit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LinkedInTab({ profile }) {
  return (
    <div className="fadein">
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
        💼 LinkedIn Insights
      </h1>
      <p style={{ color: "var(--text3)", fontSize: "13px", marginBottom: 24 }}>
        {profile.linkedin || "linkedin.com/in/user"}
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
          { label: "Connections",  val: SKILLS_DATA.linkedin.connections, color: "var(--cyan)" },
          { label: "Profile Views",val: SKILLS_DATA.linkedin.views,       color: "var(--indigo)" },
          { label: "Top Skill",    val: "Python",                          color: "var(--green)" },
          { label: "Endorsements", val: "88",                              color: "var(--amber)" },
        ].map((m) => (
          <div key={m.label} className="metric-card">
            <div style={{ fontSize: "22px", fontWeight: 700, color: m.color }}>{m.val}</div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ borderColor: "var(--border2)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: 16 }}>
          Skill Endorsements
        </h3>
        {Object.entries(SKILLS_DATA.linkedin.endorsements).map(([skill, count]) => (
          <div key={skill} style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                marginBottom: 6,
              }}
            >
              <span style={{ color: "var(--text2)" }}>{skill}</span>
              <span style={{ color: "var(--cyan)", fontWeight: 600 }}>
                {count} endorsements
              </span>
            </div>
            <MiniBar val={count} max={35} color="var(--cyan)" />
          </div>
        ))}
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
