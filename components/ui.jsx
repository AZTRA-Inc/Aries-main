"use client";

import { colors, METHOD_STYLES, FREQ_COLORS, TYPE_COLORS } from "@/lib/tokens";

// ═══════════════════════════════════════
// Method Badge — GET POST PUT DELETE PATCH HEAD OPTIONS
// ═══════════════════════════════════════
export function MethodBadge({ method }) {
  const s = METHOD_STYLES[method] || METHOD_STYLES.HEAD;
  return (
    <span
      className="font-mono text-[10px] font-bold shrink-0 inline-block text-center"
      style={{
        color: colors.t1,
        background: s.bg,
        padding: "3px 7px",
        borderRadius: 4,
        border: `1px solid ${s.border}`,
        minWidth: 48,
      }}
    >
      {method}
    </span>
  );
}

// ═══════════════════════════════════════
// Pill — Generic label with optional color
// ═══════════════════════════════════════
export function Pill({ text, color }) {
  return (
    <span
      className="font-mono text-[10px] font-semibold"
      style={{
        color: color || colors.t3,
        background: color ? color + "10" : colors.surface,
        padding: "3px 9px",
        borderRadius: 9999,
        border: `1px solid ${color ? color + "18" : colors.border}`,
      }}
    >
      {text}
    </span>
  );
}

// ═══════════════════════════════════════
// Frequency Pill — Hourly/Daily/Weekly etc.
// ═══════════════════════════════════════
export function FreqPill({ freq }) {
  const fc = FREQ_COLORS[freq] || FREQ_COLORS["On Deploy"];
  return (
    <span
      className="font-mono text-[10px] font-semibold inline-block text-center"
      style={{
        color: fc.color,
        background: fc.bg,
        padding: "3px 8px",
        borderRadius: 9999,
        border: `1px solid ${fc.border}`,
      }}
    >
      {freq}
    </span>
  );
}

// ═══════════════════════════════════════
// Confidence Badge — Progress bar + percentage
// ═══════════════════════════════════════
export function ConfBadge({ value }) {
  const c = value >= 90 ? colors.green : value >= 75 ? "#D97706" : colors.red;
  return (
    <div className="flex items-center gap-[5px]">
      <div
        className="w-[30px] h-1 rounded-full overflow-hidden"
        style={{ background: colors.surface }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, background: c }}
        />
      </div>
      <span className="font-mono text-[10px] font-semibold" style={{ color: c }}>
        {value}%
      </span>
    </div>
  );
}

// ═══════════════════════════════════════
// AI Badge
// ═══════════════════════════════════════
export function AiBadge() {
  return (
    <span
      className="font-mono text-[8px] font-bold inline-flex items-center gap-[3px]"
      style={{
        color: colors.purple,
        background: colors.purple + "0D",
        padding: "2px 7px",
        borderRadius: 9999,
        border: `1px solid ${colors.purple}20`,
        letterSpacing: 0.5,
      }}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2.5">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      </svg>
      AI
    </span>
  );
}

// ═══════════════════════════════════════
// Incident Badge
// ═══════════════════════════════════════
export function IncidentBadge({ status }) {
  const c = status === "Investigating" ? colors.red : colors.amber;
  return (
    <span
      className="font-mono text-[9px] font-bold"
      style={{
        color: c,
        background: c + "10",
        padding: "1px 6px",
        borderRadius: 9999,
        border: `1px solid ${c}20`,
      }}
    >
      {status}
    </span>
  );
}

// ═══════════════════════════════════════
// Sparkline — Mini bar chart from run data
// ═══════════════════════════════════════
export function Sparkline({ runs, height = 20 }) {
  return (
    <div className="flex items-end" style={{ gap: 1.5, height }}>
      {runs.map((r, i) => {
        const ok = r.s === "pass";
        const sec = parseDur(r.d);
        const h = Math.max(3, Math.round((sec / (12 * 60)) * height));
        return (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 3,
              height: h,
              background: ok ? colors.green : colors.red,
              opacity: 0.3 + ((runs.length - i) / runs.length) * 0.7,
            }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// Status Dot
// ═══════════════════════════════════════
export function StatusDot({ color, size = 8, hollow = false }) {
  if (hollow) {
    return (
      <span
        className="rounded-full shrink-0 inline-block"
        style={{
          width: size,
          height: size,
          background: colors.surface,
          border: `1px solid ${colors.t5}`,
        }}
      />
    );
  }
  return (
    <span
      className="rounded-full shrink-0 inline-block"
      style={{ width: size, height: size, background: color }}
    />
  );
}

// ═══════════════════════════════════════
// Toggle Switch
// ═══════════════════════════════════════
export function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className="cursor-pointer flex items-center transition-all duration-200"
      style={{
        width: 34,
        height: 20,
        background: on ? colors.green : colors.surface,
        border: `1.5px solid ${on ? colors.green : colors.border}`,
        borderRadius: 9999,
        padding: 2,
      }}
    >
      <div
        className="rounded-full bg-white transition-all duration-200"
        style={{
          width: 12,
          height: 12,
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          marginLeft: on ? 14 : 0,
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════
// Checkbox
// ═══════════════════════════════════════
export function Checkbox({ checked, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className="cursor-pointer flex items-center justify-center shrink-0 transition-all duration-100"
      style={{
        width: 14,
        height: 14,
        borderRadius: 3,
        border: `1.5px solid ${checked ? colors.t1 : colors.t5}`,
        background: checked ? colors.t1 : "transparent",
      }}
    >
      {checked && <span className="text-white text-[9px] font-bold">✓</span>}
    </div>
  );
}

// ═══════════════════════════════════════
// Stepper — +/- with numeric value
// ═══════════════════════════════════════
export function Stepper({ value, onChange, min = 0, max = 99, label }) {
  return (
    <div className="flex items-center">
      {label && (
        <span
          className="text-[10px] font-semibold uppercase mr-2"
          style={{ color: colors.t4, letterSpacing: 0.5 }}
        >
          {label}
        </span>
      )}
      <div className="flex" style={{ border: `1px solid ${colors.border}`, borderRadius: 6, overflow: "hidden" }}>
        <button
          onClick={() => value > min && onChange(value - 1)}
          className="w-[26px] h-[26px] flex items-center justify-center text-sm font-semibold bg-white hover:bg-slate-50 transition-colors"
          style={{ color: colors.t2 }}
        >
          −
        </button>
        <span
          className="w-[30px] h-[26px] flex items-center justify-center font-mono text-xs font-bold"
          style={{ color: colors.t1, borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}` }}
        >
          {value}
        </span>
        <button
          onClick={() => value < max && onChange(value + 1)}
          className="w-[26px] h-[26px] flex items-center justify-center text-sm font-semibold bg-white hover:bg-slate-50 transition-colors"
          style={{ color: colors.t2 }}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Icon Button — Square with icon slot
// ═══════════════════════════════════════
export function IconBtn({ onClick, title, children, size = 30 }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="shrink-0 flex items-center justify-center rounded-lg border transition-all duration-150 hover:bg-slate-50"
      style={{
        width: size,
        height: size,
        borderColor: colors.border,
        color: colors.t4,
      }}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════
// Segmented Control
// ═══════════════════════════════════════
export function SegmentedControl({ options, value, onChange, variant = "pill" }) {
  if (variant === "pill") {
    return (
      <div
        className="inline-flex gap-[2px] p-[3px] rounded-full"
        style={{ background: colors.surface }}
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="px-3.5 py-[5px] text-[11px] font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-[5px]"
              style={{
                background: active ? "#fff" : "transparent",
                color: active ? colors.t1 : colors.t4,
                fontWeight: active ? 600 : 500,
                boxShadow: active ? "0 1px 2px rgba(15,23,42,0.04)" : "none",
              }}
            >
              {opt.dot && (
                <span
                  className="w-[5px] h-[5px] rounded-full"
                  style={{ background: opt.dot, opacity: active ? 1 : 0.5 }}
                />
              )}
              {opt.label}
              {opt.count !== undefined && (
                <span className="font-mono text-[10px] font-semibold" style={{ color: active ? colors.t3 : colors.t5 }}>
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Rectangular variant
  return (
    <div className="flex overflow-hidden" style={{ borderRadius: 6, border: `1px solid ${colors.border}` }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-2.5 py-[5px] text-[10px] font-semibold transition-all"
            style={{
              background: active ? colors.t1 : "transparent",
              color: active ? "#fff" : colors.t4,
              border: "none",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// Type Badge — for schema field types
// ═══════════════════════════════════════
export function TypeBadge({ type }) {
  const c = TYPE_COLORS[type] || colors.t3;
  return (
    <span
      className="font-mono text-[10px] font-bold"
      style={{
        color: c,
        background: c + "10",
        padding: "1px 6px",
        borderRadius: 4,
      }}
    >
      {type}
    </span>
  );
}

// ═══════════════════════════════════════
// Button variants
// ═══════════════════════════════════════
export function Button({ children, onClick, variant = "primary", size = "md", disabled = false }) {
  const base = "font-semibold transition-all duration-100 rounded-md";
  const sizes = {
    sm: "px-3.5 py-[5px] text-[11px]",
    md: "px-[18px] py-[7px] text-xs",
    lg: "px-6 py-2 text-[13px] rounded-lg",
  };

  const styles = {
    primary: {
      background: disabled ? colors.surface : colors.t1,
      color: disabled ? colors.t4 : "#fff",
      border: "none",
      cursor: disabled ? "default" : "pointer",
    },
    secondary: {
      background: "#fff",
      color: colors.t2,
      border: `1px solid ${colors.border}`,
      cursor: "pointer",
    },
    ghost: {
      background: "transparent",
      color: colors.t5,
      border: "none",
      cursor: "pointer",
    },
    run: {
      background: "#fff",
      color: colors.t3,
      border: `1px solid ${colors.border}`,
      borderRadius: 9999,
      cursor: "pointer",
      padding: "4px 12px",
      fontSize: 11,
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} hover:opacity-90`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════
// Approve/Reject Inline Buttons
// ═══════════════════════════════════════
export function ApproveRejectBtns({ onApprove, onReject }) {
  return (
    <div className="flex gap-[3px]" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onApprove}
        className="w-[26px] h-[26px] rounded-md flex items-center justify-center text-[13px] font-bold transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900"
        style={{ border: `1.5px solid ${colors.t3}`, color: colors.t3, background: "#fff" }}
      >
        ✓
      </button>
      <button
        onClick={onReject}
        className="w-[26px] h-[26px] rounded-md flex items-center justify-center text-[11px] transition-all hover:bg-slate-500 hover:text-white hover:border-slate-500"
        style={{ border: `1.5px solid ${colors.border}`, color: colors.t4, background: "#fff" }}
      >
        ✕
      </button>
    </div>
  );
}

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════
export function parseDur(d) {
  const p = d.match(/(\d+)m\s*(\d+)s/);
  return p ? parseInt(p[1]) * 60 + parseInt(p[2]) : 0;
}

export function suiteMetrics(suite, allTests) {
  const runs = suite.runs || [];
  const total = runs.length;
  const passed = runs.filter((r) => r.s === "pass").length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const sTs = allTests.filter((t) => suite.tests.includes(t.id));
  const avgConf = sTs.length > 0 ? Math.round(sTs.reduce((a, t) => a + t.aiConf, 0) / sTs.length) : 0;
  const totalSec = runs.reduce((a, r) => a + parseDur(r.d), 0);
  const avgDur = total > 0 ? `${Math.floor(Math.round(totalSec / total) / 60)}m ${Math.round(totalSec / total) % 60}s` : "-";
  let failStreak = 0;
  for (const r of runs) { if (r.s === "fail") failStreak++; else break; }
  return { passRate, passed, total, avgConf, avgDur, failStreak, sTs, testCount: suite.tests.length };
}
