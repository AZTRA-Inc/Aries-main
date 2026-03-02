"use client";

import { useState } from "react";
import { colors } from "@/lib/tokens";
import { Button } from "./ui";

// ═══════════════════════════════════════
// Import Modal — Swagger / File / Paste / Jira tabs
// ═══════════════════════════════════════
export function ImportModal({ onClose }) {
  const [tab, setTab] = useState("swagger");

  const tabs = [
    { k: "swagger", l: "Swagger" },
    { k: "file", l: "File" },
    { k: "paste", l: "Paste" },
    { k: "jira", l: "Jira" },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(15,23,42,0.2)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white overflow-hidden"
        style={{ width: 460, borderRadius: 16, boxShadow: "0 12px 36px rgba(15,23,42,.08)", border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center px-4 py-3.5" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.t1} strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[15px] font-bold ml-2" style={{ color: colors.t1 }}>Import Requirements</span>
          <div className="flex-1" />
          <button onClick={onClose} className="text-lg font-normal leading-none" style={{ border: "none", background: "transparent", color: colors.t4 }}>×</button>
        </div>

        {/* Tab bar */}
        <div className="flex" style={{ borderBottom: `1px solid ${colors.border}` }}>
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className="flex-1 py-2.5 text-[11px] font-semibold transition-all"
              style={{
                border: "none",
                background: "transparent",
                color: tab === t.k ? colors.t1 : colors.t4,
                borderBottom: tab === t.k ? `2px solid ${colors.t1}` : `2px solid transparent`,
                marginBottom: -1,
              }}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4">
          {tab === "swagger" && (
            <div>
              <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: colors.t4, letterSpacing: 0.5 }}>
                OpenAPI URL
              </label>
              <input
                placeholder="https://api.example.com/v1/swagger.json"
                className="w-full px-2.5 py-2 font-mono text-xs outline-none rounded-lg"
                style={{ border: `1px solid ${colors.border}` }}
              />
              <p className="text-[11px] mt-1.5" style={{ color: colors.t5 }}>Parse spec → generate endpoints + AI probes</p>
            </div>
          )}

          {tab === "file" && (
            <div
              className="text-center cursor-pointer rounded-xl py-6"
              style={{ border: `1.5px dashed ${colors.border}`, background: colors.canvas }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.t5} strokeWidth="2" className="mx-auto mb-2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-xs font-semibold" style={{ color: colors.t2 }}>Drop file or browse</div>
              <div className="flex gap-1 justify-center mt-1">
                {[".yaml", ".json", ".har", ".postman"].map((x) => (
                  <span key={x} className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: colors.surface }}>
                    {x}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tab === "paste" && (
            <div>
              <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: colors.t4, letterSpacing: 0.5 }}>
                Paste Spec / Requirements
              </label>
              <textarea
                placeholder="Paste spec, requirements, or stories..."
                className="w-full h-[100px] px-2.5 py-2 font-mono text-xs outline-none rounded-lg resize-y"
                style={{ border: `1px solid ${colors.border}` }}
              />
            </div>
          )}

          {tab === "jira" && (
            <div>
              <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: colors.t4, letterSpacing: 0.5 }}>
                Jira / Confluence
              </label>
              <input
                placeholder="PROJ-123 or Confluence URL"
                className="w-full px-2.5 py-2 font-mono text-xs outline-none rounded-lg"
                style={{ border: `1px solid ${colors.border}` }}
              />
              <p className="text-[11px] mt-1.5" style={{ color: colors.t5 }}>Import stories & acceptance criteria</p>
            </div>
          )}

          <div className="flex gap-1.5 mt-3.5">
            <Button size="lg" onClick={() => {}}>
              Import & Generate
            </Button>
            <Button variant="secondary" size="lg" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
