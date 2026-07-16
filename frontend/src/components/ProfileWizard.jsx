import { useRef, useState } from "react";

const STEPS = ["Personal", "Academics", "Profiles", "Skills & Goals"];

export default function ProfileWizard({
  userEmail,
  userName,
  existingProfile,
  onComplete,
  onCancel,
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(
    existingProfile || {
      name: userName || "",
      college: "",
      degree: "",
      year: "",
      cgpa: "",
      github: "",
      leetcode: "",
      skills: "",
      jobTarget: "",
      resumeName: "",
    }
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const isEdit = !!existingProfile;

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

 const handleResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const res = await fetch("http://localhost:5000/api/resume", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      up("resumeName", file.name);
      if (data.name)    up("name", data.name);
      if (data.college) up("college", data.college);
      if (data.degree)  up("degree", data.degree);
      if (data.year)    up("year", data.year);
      if (data.cgpa)    up("cgpa", data.cgpa);
      if(data.leetcode) up("leetcode", data.leetcode);
      if(data.github) up("github", data.github);
      if (data.skills)  up("skills", Array.isArray(data.skills)
        ? data.skills.join(", ")
        : data.skills);
    } catch (err) {
      console.error(err);
      alert("Failed to process resume. Check the backend console.");
    } finally {
      setUploading(false);
    }
  };
 const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/skills/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: form.skills,
          jobTarget: form.jobTarget,
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const gapData = await res.json();
      console.log("Gap analysis result:", gapData);

      // Pass both form data and gap results to dashboard
      onComplete({ ...form, gapAnalysis: gapData });
    } catch (err) {
      console.error(err);
      alert("Failed to analyze skills. Check the backend console.");
    } finally {
      setSaving(false);
    }
  };

  const canNext = [
    form.name && form.college,
    form.degree && form.year,
    form.github || form.leetcode,
    form.skills && form.jobTarget,
  ][step];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        padding: "32px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "600px" }} className="fadein">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: 32, height: 32,
              background: "var(--indigo)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text1)" }}>
            SkillGap AI
          </span>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: "var(--text3)",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
              }}
            >
              ← Back to dashboard
            </button>
          )}
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 6 }}>
          {isEdit ? "Edit Profile" : "Set up your profile"}
        </h2>
        <p style={{ color: "var(--text3)", fontSize: "14px", marginBottom: "28px" }}>
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                className="step-dot"
                style={{
                  background: i <= step ? "var(--indigo)" : "var(--slate)",
                  color: i <= step ? "#fff" : "var(--text3)",
                  border: i === step ? "2px solid var(--indigo2)" : "none",
                }}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <div
                style={{
                  height: 2,
                  width: "100%",
                  background: i < step ? "var(--indigo)" : "var(--slate)",
                  borderRadius: 2,
                  marginTop: 4,
                }}
              />
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="card" style={{ borderColor: "var(--border2)", minHeight: 320 }}>
          {step === 0 && (
            <div className="fadein">
              <div style={{ marginBottom: 16 }}>
                <label className="label">
                  Resume (auto-fills fields){" "}
                  <span style={{ color: "var(--text3)" }}>optional</span>
                </label>
                <div
                  style={{
                    border: "2px dashed var(--border2)",
                    borderRadius: 10,
                    padding: "20px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "border-color .2s",
                  }}
                  onClick={() => fileRef.current.click()}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--indigo)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border2)")
                  }
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: "none" }}
                    onChange={handleResume}
                  />
                  {uploading ? (
                    <>
                      <div className="spinner" style={{ margin: "0 auto 8px" }} />
                      <p style={{ color: "var(--text3)", fontSize: "13px" }}>
                        Parsing resume with AI...
                      </p>
                    </>
                  ) : form.resumeName ? (
                    <>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
                      <p style={{ color: "var(--green)", fontSize: "13px", fontWeight: 500 }}>
                        {form.resumeName}
                      </p>
                      <p style={{ color: "var(--text3)", fontSize: "12px", marginTop: 4 }}>
                        Fields auto-filled ✓
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>📎</div>
                      <p style={{ color: "var(--text3)", fontSize: "13px" }}>
                        Click to upload your resume (PDF)
                      </p>
                      <p style={{ color: "var(--text3)", fontSize: "11px", marginTop: 4 }}>
                        AI will extract your details automatically
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Full name *</label>
                <input
                  value={form.name}
                  onChange={(e) => up("name", e.target.value)}
                  placeholder="Arjun Sharma"
                />
              </div>
              <div>
                <label className="label">College / University *</label>
                <input
                  value={form.college}
                  onChange={(e) => up("college", e.target.value)}
                  placeholder="IIT Delhi"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="fadein">
              <div style={{ marginBottom: 16 }}>
                <label className="label">Degree / Course *</label>
                <input
                  value={form.degree}
                  onChange={(e) => up("degree", e.target.value)}
                  placeholder="B.Tech Computer Science"
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label className="label">Year *</label>
                  <select
                    value={form.year}
                    onChange={(e) => up("year", e.target.value)}
                  >
                    <option value="">Select year</option>
                    {["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"].map(
                      (y) => (
                        <option key={y} value={y}>{y}</option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="label">CGPA / Percentage</label>
                  <input
                    value={form.cgpa}
                    onChange={(e) => up("cgpa", e.target.value)}
                    placeholder="8.5"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fadein">
              <p
                style={{
                  color: "var(--text3)",
                  fontSize: "13px",
                  marginBottom: 20,
                }}
              >
                Add at least one profile link. We analyze these to build your skill insights.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label className="label">🐙 GitHub username or URL</label>
                <input
                  value={form.github}
                  onChange={(e) => up("github", e.target.value)}
                  placeholder="github.com/username"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="label">💻 LeetCode username or URL</label>
                <input
                  value={form.leetcode}
                  onChange={(e) => up("leetcode", e.target.value)}
                  placeholder="leetcode.com/username"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fadein">
              <div style={{ marginBottom: 16 }}>
                <label className="label">Skills (comma separated) *</label>
                <textarea
                  value={form.skills}
                  onChange={(e) => up("skills", e.target.value)}
                  placeholder="Python, React, SQL, Machine Learning..."
                  rows={3}
                  style={{ resize: "none" }}
                />
              </div>
              <div>
                <label className="label">Target role / Career goal *</label>
                <select
                  value={form.jobTarget}
                  onChange={(e) => up("jobTarget", e.target.value)}
                >
                  <option value="">Select target role...</option>
                  {[
  "AI Agent Developer",
  "Prompt Engineer",
  "LLM Engineer",
  "Data Engineer (AI)",
  "AI Product Manager",
  "AI Security Engineer",
  "Senior ML Engineer",
  "NLP Engineer",
  "AI Solutions Architect",
  "ML Engineer",
  "Generative AI Engineer",
  "Deep Learning Engineer",
  "Multimodal AI Engineer",
  "MLOps Engineer",
  "AI Business Analyst",
  "RAG Engineer",
  "Robotics Engineer (AI)",
  "Senior Data Scientist",
  "AI Ethics Officer",
  "AI Infrastructure Eng",
  "AI Engineer",
  "Data Scientist",
  "Computer Vision Engineer",
  "AI Compliance Manager",
  "AI Research Scientist",
].map((r) => (
  <option key={r}>{r}</option>
))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 20,
            gap: 12,
          }}
        >
          <button
            className="btn-secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            ← Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button
              className="btn-primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={submit}
              disabled={!canNext || saving}
            >
              {saving ? (
                <>
                  <span className="spinner" />
                  Saving...
                </>
              ) : (
                "Create Profile ✓"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
