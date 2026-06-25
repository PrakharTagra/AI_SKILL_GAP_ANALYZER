import { useState } from "react";

const MOCK_USERS = {
  "demo@skillgap.ai": { password: "demo123", profile: null },
};

export default function AuthPage({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("demo@skillgap.ai");
  const [password, setPassword] = useState("demo123");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = () => {
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "login") {
        if (MOCK_USERS[email] && MOCK_USERS[email].password === password) {
          onLogin(email, MOCK_USERS[email].profile);
        } else {
          setError("Invalid email or password.");
        }
      } else {
        if (!name.trim()) return setError("Please enter your name.");
        onSignup(email, name);
      }
    }, 900);
  };

  const handleKey = (e) => { if (e.key === "Enter") handle(); };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--navy)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }} className="fadein">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: 36, height: 36,
                background: "var(--indigo)",
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}
            >
              ⚡
            </div>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--text1)" }}>
              SkillGap AI
            </span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--text1)", marginBottom: 8 }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "14px" }}>
            {mode === "login"
              ? "Sign in to view your skill dashboard"
              : "Start mapping your skill gaps today"}
          </p>
        </div>

        {/* Card */}
        <div className="card glow" style={{ borderColor: "var(--border2)" }}>
          {mode === "signup" && (
            <div style={{ marginBottom: 16 }}>
              <label className="label">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arjun Sharma"
                onKeyDown={handleKey}
              />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label className="label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={handleKey}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={handleKey}
            />
          </div>

          {error && (
            <div
              style={{
                color: "var(--red)",
                fontSize: "13px",
                marginBottom: 16,
                padding: "10px",
                background: "rgba(239,68,68,.08)",
                borderRadius: 8,
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={handle}
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              color: "var(--text3)",
              fontSize: "13px",
            }}
          >
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <span
              style={{
                color: "var(--indigo2)",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </div>
        </div>

        {/* Demo hint */}
        {mode === "login" && (
          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              padding: "10px 16px",
              background: "var(--slate)",
              borderRadius: 8,
              fontSize: "12px",
              color: "var(--text3)",
            }}
          >
            Demo:{" "}
            <span style={{ color: "var(--indigo2)" }}>demo@skillgap.ai</span>{" "}
            /{" "}
            <span style={{ color: "var(--indigo2)" }}>demo123</span>
          </div>
        )}
      </div>
    </div>
  );
}
