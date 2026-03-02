"use client";

import { useState } from "react";
import { colors } from "@/lib/tokens";
import { StatusDot, AiBadge, ConfBadge, Pill, Sparkline, Checkbox, Button, suiteMetrics, parseDur } from "./ui";

// ═══════════════════════════════════════
// Suite Card — Collapsed + Expanded with Probes, Runs, Run Now + Edit
// ═══════════════════════════════════════
export function SuiteCard({ suite, allTests, expanded, onToggle, onEdit }) {
  const m = suiteMetrics(suite, allTests);
  const runs = suite.runs || [];
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(suite.name);
  const [editFreq, setEditFreq] = useState(suite.freq);
  const [editTests, setEditTests] = useState(suite.tests);

  const toggleTest = (id) => setEditTests((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const handleSave = () => {
    if (onEdit && editName.trim()) {
      onEdit({ name: editName.trim(), freq: editFreq, tests: editTests });
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(suite.name);
    setEditFreq(suite.freq);
    setEditTests(suite.tests);
    setEditing(false);
  };

  return (
    <div
      className="bg-white overflow-hidden transition-all duration-150"
      style={{
        border: `1px solid ${expanded || editing ? colors.borderH : colors.border}`,
        borderRadius: 12,
        boxShadow: expanded || editing
          ? "0 4px 12px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.03)"
          : "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      {/* Collapsed header */}
      <div
        onClick={onToggle}
        className="grid items-center gap-3.5 px-3.5 py-2.5 cursor-pointer rounded-xl transition-colors hover:bg-slate-50"
        style={{ gridTemplateColumns: "8px 1fr repeat(4,auto) 56px 18px" }}
      >
        <StatusDot color={m.failStreak > 0 ? colors.red : !suite.enabled ? colors.t5 : colors.green} size={7} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold truncate" style={{ color: colors.t1 }}>{suite.name}</span>
            {!suite.enabled && <Pill text="OFF" />}
            {suite.incident && <Pill text={suite.incident.key} />}
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: colors.t4 }}>
            {m.testCount} probes · {suite.freq} · {suite.lastRun}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-bold" style={{ color: colors.green }}>{m.passRate}%</div>
          <div className="text-[9px] font-semibold" style={{ color: colors.t5 }}>PASS</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-semibold" style={{ color: colors.t2 }}>{m.avgDur}</div>
          <div className="text-[9px] font-semibold" style={{ color: colors.t5 }}>AVG</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-bold" style={{ color: colors.purple }}>{m.avgConf}%</div>
          <div className="text-[9px] font-semibold" style={{ color: colors.t5 }}>CONF</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-semibold" style={{ color: colors.red }}>{m.testCount}</div>
          <div className="text-[9px] font-semibold" style={{ color: colors.t5 }}>PROBES</div>
        </div>
        <Sparkline runs={runs.slice(0, 10)} height={18} />
        <svg
          width="12" height="12" fill="none" stroke={colors.t5} strokeWidth="2" viewBox="0 0 24 24"
          className="transition-transform duration-150"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0)" }}
        >
          <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${colors.border}` }}>
          {/* Probes list */}
          <div className="px-3.5 py-2.5" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <span className="text-[11px] font-semibold uppercase" style={{ color: colors.t4, letterSpacing: 0.5 }}>
              Probes · {m.sTs.length}
            </span>
            <div className="mt-1.5">
              {m.sTs.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 py-1.5"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <StatusDot
                    color={t.review === "approved" ? colors.green : t.review === "pending" ? "#D97706" : colors.t5}
                    size={6}
                  />
                  <span className="text-xs font-medium flex-1 truncate" style={{ color: colors.t1 }}>{t.name}</span>
                  {t.aiGenerated && <AiBadge />}
                  <ConfBadge value={t.aiConf} />
                </div>
              ))}
            </div>
          </div>

          {/* Run history */}
          <div className="px-3.5 py-2.5" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase" style={{ color: colors.t4, letterSpacing: 0.5 }}>
                Runs · {runs.length}
              </span>
              <span className="text-[11px]" style={{ color: colors.t5 }}>Schedule: {suite.schedule}</span>
            </div>
            <div className="flex gap-0.5 items-end h-7">
              {runs.map((r, i) => {
                const h = Math.max(4, Math.round((parseDur(r.d) / (12 * 60)) * 24));
                return (
                  <div
                    key={i}
                    title={r.d}
                    className="flex-1 max-w-[10px] rounded-sm"
                    style={{
                      height: h,
                      background: r.s === "pass" ? colors.green : colors.red,
                      opacity: 0.25 + ((runs.length - i) / runs.length) * 0.75,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          {!editing && (
            <div className="flex gap-1.5 px-3.5 py-2.5 pb-3">
              <Button>Run Now</Button>
              <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setEditing(true); }}>Edit</Button>
            </div>
          )}

          {/* Inline edit panel */}
          {editing && (
            <div className="px-3.5 py-2.5 pb-3" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] font-semibold uppercase block mb-2" style={{ color: colors.t4, letterSpacing: 0.5 }}>
                Edit Suite
              </span>
              <div className="flex gap-2 mb-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 font-mono text-xs outline-none rounded-md transition-all focus:ring-2"
                  style={{ border: `1px solid ${colors.border}`, color: colors.t1, background: "#fff" }}
                />
                <div className="flex overflow-hidden" style={{ borderRadius: 6, border: `1px solid ${colors.border}` }}>
                  {["Hourly", "Daily", "Weekly"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setEditFreq(f)}
                      className="px-2 py-[5px] text-[10px] font-semibold transition-all"
                      style={{
                        background: editFreq === f ? colors.t1 : "transparent",
                        color: editFreq === f ? "#fff" : colors.t4,
                        border: "none",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-[130px] overflow-auto rounded-md mb-2" style={{ border: `1px solid ${colors.border}` }}>
                {allTests.filter((t) => t.review !== "rejected").slice(0, 25).map((t) => {
                  const checked = editTests.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTest(t.id)}
                      className="flex items-center gap-1.5 px-2 py-[5px] cursor-pointer text-[11px] transition-colors hover:bg-slate-50"
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        background: checked ? colors.surface : "transparent",
                      }}
                    >
                      <Checkbox checked={checked} />
                      <span className="font-medium truncate flex-1" style={{ color: colors.t1 }}>{t.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-1.5 items-center">
                <span className="text-[10px] font-medium" style={{ color: colors.t4 }}>{editTests.length} probes</span>
                <div className="flex-1" />
                <Button onClick={handleCancel} variant="secondary" size="sm">Cancel</Button>
                <Button onClick={handleSave} size="sm">Save</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Inline Suite Builder
// ═══════════════════════════════════════
export function InlineSuiteBuilder({ allTests, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [sel, setSel] = useState([]);
  const [freq, setFreq] = useState("Daily");

  const toggle = (id) => setSel((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const canCreate = name.trim().length > 0 && sel.length > 0;

  return (
    <div
      className="bg-white overflow-hidden mb-2.5"
      style={{
        border: `1.5px solid ${colors.borderH}`,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.03)",
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: colors.canvas, borderBottom: `1px solid ${colors.border}` }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.t3} strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        <span className="text-xs font-bold" style={{ color: colors.t1 }}>New Suite</span>
        <div className="flex-1" />
        <button onClick={onClose} className="text-base font-medium leading-none" style={{ border: "none", background: "transparent", color: colors.t4 }}>
          ×
        </button>
      </div>

      <div className="p-3 flex flex-col gap-2.5">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Suite name"
            className="flex-1 px-2.5 py-1.5 font-mono text-xs outline-none rounded-md transition-all focus:ring-2"
            style={{ border: `1px solid ${colors.border}`, color: colors.t1, background: "#fff" }}
          />
          <div className="flex overflow-hidden" style={{ borderRadius: 6, border: `1px solid ${colors.border}` }}>
            {["Hourly", "Daily", "Weekly"].map((f) => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                className="px-2 py-[5px] text-[10px] font-semibold transition-all"
                style={{
                  background: freq === f ? colors.t1 : "transparent",
                  color: freq === f ? "#fff" : colors.t4,
                  border: "none",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[130px] overflow-auto rounded-md" style={{ border: `1px solid ${colors.border}` }}>
          {allTests.filter((t) => t.review !== "rejected").slice(0, 25).map((t) => {
            const checked = sel.includes(t.id);
            return (
              <div
                key={t.id}
                onClick={() => toggle(t.id)}
                className="flex items-center gap-1.5 px-2 py-[5px] cursor-pointer text-[11px] transition-colors hover:bg-slate-50"
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                  background: checked ? colors.surface : "transparent",
                }}
              >
                <Checkbox checked={checked} />
                <span className="font-medium truncate flex-1" style={{ color: colors.t1 }}>{t.name}</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1.5 items-center">
          <span className="text-[10px] font-medium" style={{ color: colors.t4 }}>{sel.length} selected</span>
          <div className="flex-1" />
          <Button onClick={onClose} variant="secondary" size="sm">Cancel</Button>
          <Button
            onClick={() => canCreate && onCreate({ name: name.trim(), tests: sel, freq })}
            disabled={!canCreate}
            size="sm"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
