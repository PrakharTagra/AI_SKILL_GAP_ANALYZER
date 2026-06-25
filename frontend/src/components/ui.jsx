import { useEffect, useState } from "react";

export function Ring({ percent, color, size = 64, stroke = 5 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setP(percent), 200);
    return () => clearTimeout(t);
  }, [percent]);
  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
    >
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="var(--slate)" strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={circ - (circ * p) / 100}
        style={{ transition: "stroke-dashoffset 1s ease" }}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MiniBar({ val, max, color }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((val / max) * 100), 300);
    return () => clearTimeout(t);
  }, [val, max]);
  return (
    <div className="progress-bar-bg" style={{ flex: 1 }}>
      <div
        className="progress-bar-fill"
        style={{ width: `${w}%`, background: color }}
      />
    </div>
  );
}

export function MetricCard({ label, val, color, icon }) {
  return (
    <div className="metric-card" style={{ borderColor: `${color}22` }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: "22px", fontWeight: 700, color }}>{val}</div>
      <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}
