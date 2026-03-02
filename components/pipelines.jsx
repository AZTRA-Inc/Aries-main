"use client";

import { useState } from "react";
import { colors, FREQ_COLORS } from "@/lib/tokens";
import { Toggle, StatusDot, FreqPill, SegmentedControl, Button, suiteMetrics } from "./ui";

// ═══════════════════════════════════════
// Pipelines View — Full schedule/pipeline management
// ═══════════════════════════════════════
export function PipelinesView({ suites, setSuites, tests }) {
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [freqFilter, setFreqFilter] = useState("All");

  const filtered = suites.filter((s) => {
    if (filter && !s.name.toLowerCase().includes(filter.toLowerCase())) return false;
    if (freqFilter !== "All" && s.freq !== freqFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "freq") {
      const order = { Hourly: 0, Daily: 1, "Bi-Weekly": 2, Weekly: 3, "On Deploy": 4 };
      return (order[a.freq] || 5) - (order[b.freq] || 5);
    }
    if (sortBy === "pass") return suiteMetrics(b, tests).passRate - suiteMetrics(a, tests).passRate;
    if (sortBy === "schedule") return a.schedule.localeCompare(b.schedule);
    return 0;
  });

  const toggleEnabled = (id) => setSuites((p) => p.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  const enabledCount = suites.filter((s) => s.enabled).length;
  const freqCounts = {};
  suites.forEach((s) => { freqCounts[s.freq] = (freqCounts[s.freq] || 0) + 1; });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const freqOptions = ["All", "Hourly", "Daily", "Weekly", "Bi-Weekly", "On Deploy"].map((f) => ({
    value: f,
    label: f,
    count: f === "All" ? suites.length : freqCounts[f] || 0,
    dot: f !== "All" ? (FREQ_COLORS[f]?.color || colors.t3) : undefined,
  }));

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "freq", label: "Frequency" },
    { value: "pass", label: "Pass Rate" },
    { value: "schedule", label: "Schedule" },
  ];

  return (
    <div className="flex-1 overflow-auto bg-white">
      {/* Header + toolbar */}
      <div className="px-5 pt-4 pb-3.5" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3 mb-3.5">
          <span className="text-[17px] font-bold" style={{ color: colors.t1 }}>Pipelines</span>
          <span className="text-[13px] font-medium" style={{ color: colors.t4 }}>
            {enabledCount}<span style={{ color: colors.t5 }}> / {suites.length}</span> active
          </span>
          <div className="flex-1" />
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.t4} strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search pipelines..."
              className="py-[7px] pl-[30px] pr-3 text-xs outline-none rounded-full transition-all w-[220px] focus:ring-2"
              style={{ border: `1px solid ${colors.border}`, background: colors.canvas, color: colors.t1 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl options={freqOptions} value={freqFilter} onChange={setFreqFilter} variant="pill" />
          <div className="flex-1" />
          <span className="text-[10px] font-semibold uppercase" style={{ color: colors.t5, letterSpacing: 0.5 }}>Sort</span>
          <SegmentedControl options={sortOptions} value={sortBy} onChange={setSortBy} variant="rect" />
        </div>
      </div>

      {/* 24h Timeline */}
      <div className="px-5 py-3" style={{ background: colors.canvas, borderBottom: `1px solid ${colors.border}` }}>
        <div className="text-[10px] font-semibold uppercase mb-2" style={{ color: colors.t5, letterSpacing: 0.5 }}>
          24h Timeline
        </div>
        <div className="flex gap-px h-9 items-end">
          {hours.map((h) => {
            const hourSuites = suites.filter((s) => s.enabled && parseInt(s.schedule) === h);
            const count = hourSuites.length;
            const barH = Math.max(2, Math.round((count / 8) * 32));
            const failCount = hourSuites.filter((s) => s.runs?.length > 0 && s.runs[0].s === "fail").length;
            const barCol = count === 0 ? colors.surface : failCount > 0 ? (failCount >= count / 2 ? colors.red : colors.amber) : colors.green;
            return (
              <div key={h} className="flex-1">
                <div style={{ width: "100%", height: barH, background: barCol, opacity: count > 0 ? 0.7 : 1 }} title={`${h}:00 — ${count} suites`} />
              </div>
            );
          })}
        </div>
        <div className="flex gap-px mt-1">
          {hours.map((h) => (
            <div key={h} className="flex-1 text-center font-mono text-[8px]" style={{ color: colors.t5 }}>
              {h % 6 === 0 ? String(h).padStart(2, "0") : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div
        className="grid items-center px-5 py-2"
        style={{ gridTemplateColumns: "40px 1fr 90px 90px 60px 70px 100px 60px", background: colors.canvas, borderBottom: `1px solid ${colors.border}` }}
      >
        {["", "SUITE", "FREQ", "SCHEDULE", "PROBES", "CONF", "PASS RATE", ""].map((h, i) => (
          <span key={i} className="text-[9px] font-semibold" style={{ color: colors.t5, letterSpacing: 0.6 }}>{h}</span>
        ))}
      </div>

      {/* Table rows */}
      {sorted.map((s) => {
        const m = suiteMetrics(s, tests);
        const fc = FREQ_COLORS[s.freq] || FREQ_COLORS["On Deploy"];
        return (
          <div
            key={s.id}
            className="grid items-center px-5 py-2.5 transition-all hover:bg-slate-50"
            style={{
              gridTemplateColumns: "40px 1fr 90px 90px 60px 70px 100px 60px",
              borderBottom: `1px solid ${colors.border}`,
              opacity: s.enabled ? 1 : 0.45,
            }}
          >
            <Toggle on={s.enabled} onToggle={() => toggleEnabled(s.id)} />
            <div>
              <div className="flex items-center gap-1.5">
                <StatusDot color={m.failStreak > 0 ? colors.red : s.enabled ? colors.green : colors.t5} size={6} />
                <span className="text-[13px] font-semibold truncate" style={{ color: colors.t1 }}>{s.name}</span>
                {s.incident && (
                  <span className="font-mono text-[9px] font-bold px-1.5 rounded-full" style={{ color: colors.red, background: colors.red + "10", border: `1px solid ${colors.red}20` }}>
                    {s.incident.status}
                  </span>
                )}
              </div>
              <div className="text-[11px] ml-3 mt-px" style={{ color: colors.t5 }}>{s.lastRun}</div>
            </div>
            <FreqPill freq={s.freq} />
            <span className="font-mono text-xs font-semibold" style={{ color: colors.t2 }}>{s.schedule}</span>
            <span className="font-mono text-xs font-bold" style={{ color: colors.red }}>{m.testCount}</span>
            <span className="font-mono text-xs font-bold" style={{ color: colors.purple }}>{m.avgConf}%</span>
            <div className="flex items-center gap-[5px]">
              <div className="w-9 h-1 rounded-full overflow-hidden" style={{ background: colors.surface }}>
                <div className="h-full rounded-full" style={{ width: `${m.passRate}%`, background: colors.green }} />
              </div>
              <span className="font-mono text-[11px] font-bold" style={{ color: colors.green }}>{m.passRate}%</span>
            </div>
            <Button variant="run">Run</Button>
          </div>
        );
      })}

      {sorted.length === 0 && (
        <div className="py-10 text-center text-[13px]" style={{ color: colors.t4 }}>No pipelines match your filter</div>
      )}
    </div>
  );
}
