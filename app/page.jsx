"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/lib/tokens";
import { ENDPOINTS, INIT_TESTS, INIT_SUITES } from "@/lib/data";
import { MethodBadge, Pill, AiBadge, ConfBadge, IconBtn, Button, Checkbox, suiteMetrics } from "@/components/ui";
import { ProbeRow, ReviewStrip } from "@/components/probes";
import { SuiteCard, InlineSuiteBuilder } from "@/components/suites";
import { TreeView, RawView } from "@/components/schema";
import { ImportModal } from "@/components/import-modal";
import { PipelinesView } from "@/components/pipelines";

// ═══════════════════════════════════════
// KPI Health Strip
// ═══════════════════════════════════════
function HealthStrip({ suites, tests, open, onToggle }) {
  const allRuns = suites.flatMap((s) => s.runs || []);
  const totalRuns = allRuns.length;
  const passed = allRuns.filter((r) => r.s === "pass").length;
  const globalPass = totalRuns > 0 ? Math.round((passed / totalRuns) * 100) : 0;
  const incidents = suites.filter((s) => s.incident).length;
  const pending = tests.filter((t) => t.review === "pending").length;
  const approved = tests.filter((t) => t.review === "approved").length;
  const coverage = tests.length > 0 ? Math.round((approved / tests.length) * 100) : 0;
  const failing = suites.filter((s) => s.runs?.length > 0 && s.runs[0].s === "fail").length;

  const items = [
    { v: globalPass + "%", l: "Pass Rate", c: colors.green },
    { v: ENDPOINTS.length, l: "Endpoints", c: colors.t1 },
    { v: suites.length, l: "Suites", c: colors.t1 },
    { v: tests.length, l: "Probes", c: colors.red },
    { v: coverage + "%", l: "Coverage", c: colors.purple },
    { v: pending, l: "Pending", c: pending > 0 ? colors.amber : colors.green },
    { v: incidents, l: "Incidents", c: incidents > 0 ? colors.red : colors.green },
    { v: failing, l: "Failing", c: failing > 0 ? colors.red : colors.green },
  ];

  return (
    <div
      className="shrink-0 overflow-hidden transition-all duration-200"
      style={{
        maxHeight: open ? 60 : 0,
        opacity: open ? 1 : 0,
        borderBottom: open ? `1px solid ${colors.border}` : "none",
        background: colors.canvas,
      }}
    >
      <div className="flex items-stretch" style={{ cursor: "pointer" }} onClick={onToggle}>
        {items.map((m, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-center py-2.5"
            style={{ borderRight: i < items.length - 1 ? `1px solid ${colors.border}` : "none" }}
          >
            <span className="font-mono text-base font-bold leading-none" style={{ color: m.c, letterSpacing: -0.3 }}>
              {m.v}
            </span>
            <span className="text-[9px] font-semibold mt-1 uppercase" style={{ color: colors.t4, letterSpacing: 0.5 }}>
              {m.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Specs View — Generated test code for probes
// ═══════════════════════════════════════
function TestCasesView({ probes, endpoint }) {
  if (!probes.length) {
    return <div className="py-8 px-5 text-center text-[13px]" style={{ color: colors.t5 }}>No probes for this endpoint</div>;
  }

  return (
    <div className="px-5 py-3.5">
      {probes.map((t) => {
        const statusMap = { approved: "200 OK", pending: "200 OK", rejected: "400 Bad Request" };
        const method = endpoint.method;
        const path = endpoint.path;
        const hasId = path.includes("{id}");
        const resource = path.split("/").pop().replace("{id}", "").replace(/-/g, "_") || "resource";

        const posAssertions = [];
        posAssertions.push(`expect(response.status).toBe(${t.review === "rejected" ? 400 : 200});`);
        posAssertions.push(`expect(response.body).toHaveProperty("${hasId ? "id" : "data"}");`);
        if (t.pos > 1) posAssertions.push(`expect(response.headers["content-type"]).toContain("application/json");`);
        if (t.pos > 2) posAssertions.push(`expect(response.body.${hasId ? "id" : "data"}).toBeDefined();`);
        if (t.pos > 3) posAssertions.push(`expect(response.latency).toBeLessThan(${endpoint.time.replace("ms", "").replace("s", "000")});`);

        const negAssertions = [];
        if (t.neg > 0) negAssertions.push(`expect(errorResponse.status).toBe(${method === "GET" ? 404 : 422});`);
        if (t.neg > 1) negAssertions.push(`expect(errorResponse.body).toHaveProperty("error");`);
        if (t.neg > 2) negAssertions.push(`expect(unauthorizedResponse.status).toBe(401);`);

        const code = `describe("${t.name}", () => {
  it("should handle valid ${method} ${path}", async () => {
    const response = await request.${method.toLowerCase()}("${path}"${hasId ? ".replace(\"{id}\", testId)" : ""})
      .set("Authorization", "Bearer \${token}");

    ${posAssertions.join("\n    ")}
  });${negAssertions.length > 0 ? `

  it("should reject invalid input", async () => {
    const errorResponse = await request.${method.toLowerCase()}("${path}"${hasId ? ".replace(\"{id}\", \"invalid\")" : ""})
      .send({ invalid: true });

    ${negAssertions.join("\n    ")}
  });` : ""}
});`;

        return (
          <div key={t.id} className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: t.review === "approved" ? colors.green : t.review === "pending" ? "#D97706" : colors.t5 }}
              />
              <span className="text-[12px] font-semibold truncate" style={{ color: colors.t1 }}>{t.name}</span>
              {t.aiGenerated && <AiBadge />}
              <div className="flex-1" />
              <span className="font-mono text-[10px] font-medium" style={{ color: colors.t4 }}>
                {t.pos} pos · {t.neg} neg
              </span>
            </div>
            <pre
              className="font-mono text-[11px] leading-relaxed p-3 rounded-lg overflow-auto"
              style={{
                background: colors.canvas,
                border: `1px solid ${colors.border}`,
                color: colors.t2,
                maxHeight: 220,
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {code}
            </pre>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// Main App
// ═══════════════════════════════════════
export default function Aries() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [tests, setTests] = useState(INIT_TESTS);
  const [suites, setSuites] = useState(INIT_SUITES);
  const [selEpId, setSelEpId] = useState("r0");
  const [expT, setExpT] = useState(null);
  const [expSuite, setExpSuite] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [epFilter, setEpFilter] = useState("");
  const [topTab, setTopTab] = useState("explorer");
  const [rightTab, setRightTab] = useState("probes");
  const [showImport, setShowImport] = useState(false);
  const [schemaView, setSchemaView] = useState(null);
  const [selectedProbes, setSelectedProbes] = useState([]);
  const [kpiOpen, setKpiOpen] = useState(true);

  useEffect(function () {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("aries_auth")) {
        router.push("/login");
      } else {
        setAuthChecked(true);
      }
    }
  }, [router]);

  function handleSignOut() {
    localStorage.removeItem("aries_auth");
    router.push("/login");
  }

  if (!authChecked) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ background: colors.canvas }}>
        <div className="text-xs" style={{ color: colors.t4 }}>Loading...</div>
      </div>
    );
  }

  // Actions
  const rv = (id, s) => setTests((p) => p.map((t) => (t.id === id ? { ...t, review: s } : t)));
  const updPos = (id, v) => setTests((p) => p.map((t) => (t.id === id ? { ...t, pos: v } : t)));
  const updNeg = (id, v) => setTests((p) => p.map((t) => (t.id === id ? { ...t, neg: v } : t)));
  const aaEp = (epId) => setTests((p) => p.map((t) => (t.ep === epId && t.review === "pending" ? { ...t, review: "approved" } : t)));

  const selEp = ENDPOINTS.find((e) => e.id === selEpId);
  const linked = tests.filter((t) => t.ep === selEpId);
  const relatedSuites = suites.filter((s) => s.tests.some((tid) => linked.some((t) => t.id === tid)));
  const filteredEps = epFilter
    ? ENDPOINTS.filter((e) => e.path.toLowerCase().includes(epFilter.toLowerCase()) || e.method.toLowerCase().includes(epFilter.toLowerCase()))
    : ENDPOINTS;

  return (
    <div className="w-full h-screen flex flex-col font-sans text-sm antialiased relative" style={{ color: colors.t1, background: colors.canvas }}>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      {/* ═══ Header ═══ */}
      <div className="flex items-center h-[52px] shrink-0 bg-white" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-2.5 px-5 h-full" style={{ borderRight: `1px solid ${colors.border}` }}>
          {/* Aries zodiac sign in dark box */}
          <div className="w-[28px] h-[28px] rounded-lg flex items-center justify-center" style={{ background: colors.t1 }}>
            <svg width="18" height="18" viewBox="-1 -2 26 26" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 23V13"/>
              <path d="M12 13 C5 3, -3 1, -1 7 C1 13, 8 13, 10 6"/>
              <path d="M12 13 C19 3, 27 1, 25 7 C23 13, 16 13, 14 6"/>
            </svg>
          </div>
          {/* Aries SVG wordmark */}
          <svg width="80" height="32" viewBox="0 0 441 179" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* A */}
            <path d="M5 179V175.947L19.0852 117.947L44.2903 5H49.9032L75.1613 117.947L89.1935 175.947V179" stroke={colors.t1} strokeWidth="8.41935"/>
            <path d="M12 144C23.5789 122.917 50.7895 80.2 67 78" stroke={colors.t1} strokeWidth="7"/>
            {/* r */}
            <path d="M118.87 178.999V109.239M118.87 70.0293V109.239M118.87 109.239C118.87 109.239 123.402 98.0572 127.289 91.7988C131.176 85.5404 133.24 82.3117 138.515 78.4487C143.789 74.5856 146.978 73.3182 152.547 72.8357C158.116 72.3533 162.542 73.2528 166.579 75.6422C170.617 78.0316 173.371 79.8458 174.999 84.0616C176.627 88.2773 177.805 92.4809 174.999 98.0938C172.192 103.707 166.579 106.513 166.579 106.513" stroke={colors.t1} strokeWidth="8.98065"/>
            {/* i e s */}
            <path d="M191.733 176.225V70.7025H201.162V176.225H191.733ZM196.447 42.638C194.352 42.638 192.631 42.0393 191.284 40.8419C190.086 39.6445 189.487 38.0728 189.487 36.127C189.487 34.1812 190.086 32.6096 191.284 31.4122C192.631 30.2148 194.352 29.6161 196.447 29.6161C198.543 29.6161 200.189 30.2148 201.387 31.4122C202.734 32.6096 203.407 34.1812 203.407 36.127C203.407 38.0728 202.734 39.6445 201.387 40.8419C200.189 42.0393 198.543 42.638 196.447 42.638ZM276.731 178.47C266.553 178.47 257.498 176.225 249.565 171.735C241.782 167.244 235.645 160.883 231.155 152.651C226.814 144.419 224.644 134.69 224.644 123.464C224.644 112.238 226.814 102.509 231.155 94.2767C235.645 86.0445 241.632 79.6832 249.116 75.1928C256.6 70.7025 265.056 68.4574 274.486 68.4574C284.515 68.4574 293.046 70.5528 300.081 74.7438C307.265 78.9348 312.729 84.4728 316.471 91.358C320.213 98.0935 322.084 105.577 322.084 113.81C322.084 115.905 321.784 118.075 321.185 120.321C320.587 122.566 319.988 124.362 319.389 125.709H234.522C234.672 134.839 236.543 142.772 240.135 149.508C243.877 156.093 248.891 161.183 255.178 164.775C261.614 168.217 268.948 169.939 277.18 169.939C284.664 169.939 291.175 168.741 296.713 166.346C302.401 163.952 307.789 160.509 312.878 156.019L317.593 163.203C312.205 168.292 306.218 172.109 299.632 174.653C293.046 177.198 285.413 178.47 276.731 178.47ZM234.522 117.177H311.531C311.831 116.728 311.98 116.13 311.98 115.381C312.13 114.633 312.205 113.959 312.205 113.361C312.205 106.326 310.708 100.114 307.715 94.7257C304.871 89.3374 300.68 85.0716 295.142 81.9283C289.604 78.7851 282.718 77.2135 274.486 77.2135C267.751 77.2135 261.464 78.7851 255.627 81.9283C249.939 85.0716 245.149 89.6367 241.258 95.6238C237.516 101.461 235.271 108.646 234.522 117.177ZM379.688 178.47C371.904 178.47 364.72 177.198 358.134 174.653C351.548 171.959 345.187 168.217 339.05 163.428L344.214 155.794C350.351 160.434 356.188 163.952 361.726 166.346C367.264 168.741 373.326 169.939 379.912 169.939C390.39 169.939 398.173 167.918 403.262 163.877C408.351 159.686 410.895 154.297 410.895 147.712C410.895 142.473 409.474 138.432 406.63 135.588C403.935 132.744 398.772 130.648 391.138 129.301L368.686 125.035C360.005 123.389 353.419 120.47 348.929 116.279C344.588 111.939 342.418 106.401 342.418 99.6651C342.418 93.9774 343.84 88.8135 346.684 84.1735C349.677 79.3838 353.943 75.567 359.481 72.7232C365.169 69.8793 371.979 68.4574 379.912 68.4574C387.546 68.4574 394.581 69.7296 401.017 72.2741C407.453 74.669 412.916 77.887 417.406 81.9283L412.243 89.3374C407.902 85.5954 403.037 82.6767 397.649 80.5812C392.261 78.3361 386.423 77.2135 380.137 77.2135C371.605 77.2135 364.795 79.2341 359.706 83.2754C354.766 87.167 352.297 92.4806 352.297 99.2161C352.297 103.557 353.719 107.149 356.563 109.993C359.556 112.687 364.346 114.633 370.932 115.83L393.383 120.096C402.064 121.743 408.8 124.586 413.59 128.628C418.379 132.669 420.774 138.881 420.774 147.263C420.774 156.543 417.257 164.101 410.222 169.939C403.187 175.626 393.009 178.47 379.688 178.47Z" fill={colors.t1}/>
          </svg>
        </div>
        <div className="flex h-full">
          {[{ k: "explorer", l: "Explorer" }, { k: "pipelines", l: "Pipelines" }].map((t) => {
            const active = topTab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => { setTopTab(t.k); setKpiOpen(false); }}
                className="px-5 text-[13px] font-semibold bg-transparent transition-all"
                style={{
                  border: "none",
                  color: active ? colors.t1 : colors.t4,
                  borderBottom: active ? `2px solid ${colors.t1}` : `2px solid transparent`,
                }}
              >
                {t.l}
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 px-5">
          <Pill text={`${tests.filter((t) => t.review === "pending").length} pending`} color={colors.t3} />
          <Pill text={`${suites.length} suites`} color={colors.t3} />
          <Pill text={`${ENDPOINTS.length} endpoints`} color={colors.t4} />
        </div>
        <div className="flex items-center gap-2 pr-4">
          <button
            onClick={() => setKpiOpen((o) => !o)}
            title={kpiOpen ? "Hide KPIs" : "Show KPIs"}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all cursor-pointer"
            style={{ background: "transparent", border: `1px solid ${colors.border}`, color: colors.t4 }}
            onMouseEnter={function (e) { e.currentTarget.style.background = colors.canvas; e.currentTarget.style.color = colors.t1; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = colors.t4; }}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              style={{ transform: kpiOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer"
            style={{ background: "transparent", border: "1px solid " + colors.border, color: colors.t3 }}
            onMouseEnter={function (e) { e.currentTarget.style.background = colors.canvas; e.currentTarget.style.color = colors.t1; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = colors.t3; }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <HealthStrip suites={suites} tests={tests} open={kpiOpen} onToggle={() => setKpiOpen((o) => !o)} />

      {/* ═══ EXPLORER ═══ */}
      {topTab === "explorer" && (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[340px] shrink-0 flex flex-col bg-white" style={{ borderRight: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <input
                value={epFilter}
                onChange={(e) => setEpFilter(e.target.value)}
                placeholder={`Search ${ENDPOINTS.length} endpoints...`}
                className="flex-1 px-2.5 py-[7px] font-mono text-xs outline-none rounded-lg transition-all focus:ring-2"
                style={{ border: `1px solid ${colors.border}`, background: colors.canvas, color: colors.t1 }}
              />
              <IconBtn onClick={() => setShowImport(true)} title="Import Requirements">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconBtn>
            </div>
            <div className="flex-1 overflow-auto">
              {filteredEps.map((e) => {
                const active = selEpId === e.id;
                const tc = tests.filter((t) => t.ep === e.id).length;
                const pc = tests.filter((t) => t.ep === e.id && t.review === "pending").length;
                return (
                  <div
                    key={e.id}
                    onClick={() => { setSelEpId(e.id); setExpT(null); setExpSuite(null); setKpiOpen(false); }}
                    className="flex items-center gap-2 px-3 py-[7px] cursor-pointer transition-all hover:bg-slate-50"
                    style={{
                      background: active ? colors.canvas : "transparent",
                      borderLeft: active ? `3px solid ${colors.t1}` : "3px solid transparent",
                    }}
                  >
                    <MethodBadge method={e.method} />
                    <code className="font-mono text-[11.5px] flex-1 truncate" style={{ color: active ? colors.t1 : colors.t2, fontWeight: active ? 600 : 400 }}>
                      {e.path}
                    </code>
                    {tc > 0 && <span className="font-mono text-[10px] font-semibold" style={{ color: colors.t5 }}>{tc}</span>}
                    {pc > 0 && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: colors.t4 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto bg-white">
            {selEp && (
              <div>
                {/* Endpoint header */}
                <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <MethodBadge method={selEp.method} />
                  <code className="font-mono text-base font-bold" style={{ letterSpacing: -0.3 }}>{selEp.path}</code>
                  <Pill text={selEp.time} />
                  <Pill text={`${selEp.fieldCount} fields`} />
                  <div className="flex-1" />
                  <Pill text={`${linked.length} probes`} color={colors.t4} />
                  <Pill text={`${relatedSuites.length} suites`} color={colors.t3} />
                </div>

                {/* Sub-tabs */}
                <div className="flex" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {[{ k: "probes", l: "Probes", c: linked.length }, { k: "suites", l: "Suites", c: relatedSuites.length }].map((tab) => {
                    const active = rightTab === tab.k;
                    return (
                      <button
                        key={tab.k}
                        onClick={() => setRightTab(tab.k)}
                        className="px-5 py-[11px] text-[13px] font-semibold bg-transparent transition-all"
                        style={{
                          border: "none",
                          color: active ? colors.t1 : colors.t4,
                          borderBottom: active ? `2px solid ${colors.t1}` : "2px solid transparent",
                        }}
                      >
                        {tab.l}
                      </button>
                    );
                  })}
                </div>

                {/* Probes tab */}
                {rightTab === "probes" && (
                  <div>
                    <div className="flex items-center gap-2.5 px-5 pt-3.5">
                      {selectedProbes.length > 0 && (
                        <Checkbox
                          checked={linked.length > 0 && selectedProbes.length === linked.length}
                          onToggle={() => {
                            if (selectedProbes.length === linked.length) {
                              setSelectedProbes([]);
                            } else {
                              setSelectedProbes(linked.map((t) => t.id));
                            }
                          }}
                        />
                      )}
                      <AiBadge />
                      <div className="flex-1" />
                      {selectedProbes.length > 0 && (
                        <Button variant="secondary" onClick={() => setSelectedProbes([])}>Cancel</Button>
                      )}
                      <Button>Generate</Button>
                    </div>
                    <ReviewStrip tests={linked} onApproveAll={() => aaEp(selEp.id)} />
                    <div className="pb-3">
                      {linked.map((t) => (
                        <ProbeRow
                          key={t.id} t={t}
                          expanded={expT === t.id}
                          onToggle={() => setExpT(expT === t.id ? null : t.id)}
                          onApprove={() => rv(t.id, "approved")}
                          onReject={() => rv(t.id, "rejected")}
                          onReset={() => rv(t.id, "pending")}
                          onUpdatePos={(v) => updPos(t.id, v)}
                          onUpdateNeg={(v) => updNeg(t.id, v)}
                          selected={selectedProbes.includes(t.id)}
                          showCheckbox={selectedProbes.length > 0}
                          onSelect={() => setSelectedProbes((p) => p.includes(t.id) ? p.filter((x) => x !== t.id) : [...p, t.id])}
                        />
                      ))}
                      {linked.length === 0 && (
                        <div className="py-10 px-5 text-[13px] text-center" style={{ color: colors.t5 }}>No probes for this endpoint</div>
                      )}
                    </div>

                    {/* Schema + Specs section */}
                    <div style={{ borderTop: `1px solid ${colors.border}` }}>
                      <div className="flex items-center gap-0 px-5" style={{ borderBottom: `1px solid ${colors.border}` }}>
                        {["tree", "raw", "specs"].map((v) => {
                          const active = schemaView === v;
                          return (
                            <button
                              key={v}
                              onClick={() => setSchemaView(schemaView === v ? null : v)}
                              className="px-3.5 py-2.5 text-xs font-semibold capitalize bg-transparent transition-all"
                              style={{
                                border: "none",
                                color: active ? colors.t1 : colors.t4,
                                borderBottom: active ? `2px solid ${colors.t1}` : "2px solid transparent",
                                marginBottom: -1,
                              }}
                            >
                              {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                          );
                        })}
                        <div className="flex-1" />
                        <Pill text={`${selEp.schema.length} fields`} />
                      </div>
                      {schemaView === "tree" && <TreeView schema={selEp.schema} method={selEp.method} path={selEp.path} />}
                      {schemaView === "raw" && <RawView schema={selEp.schema} method={selEp.method} path={selEp.path} time={selEp.time} fieldCount={selEp.fieldCount} />}
                      {schemaView === "specs" && <TestCasesView probes={linked} endpoint={selEp} />}
                    </div>
                  </div>
                )}

                {/* Suites tab */}
                {rightTab === "suites" && (
                  <div className="p-5">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-[11px] font-semibold uppercase" style={{ color: colors.t4, letterSpacing: 0.5 }}>
                        Related Suites
                      </span>
                      <div className="flex-1" />
                      <IconBtn onClick={() => setShowBuilder(!showBuilder)} title="Create Suite">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                        </svg>
                      </IconBtn>
                    </div>
                    {showBuilder && (
                      <InlineSuiteBuilder
                        allTests={tests}
                        defaultName="AI Generated"
                        onClose={() => setShowBuilder(false)}
                        onCreate={(data) => {
                          setSuites((p) => [...p, { id: "s" + p.length, name: data.name, tests: data.tests, runs: [], freq: data.freq, schedule: "00:00 UTC", lastRun: "Never", nextRun: "Scheduled", enabled: true, incident: null }]);
                          setShowBuilder(false);
                        }}
                      />
                    )}
                    <div className="flex flex-col gap-2">
                      {relatedSuites.map((s) => (
                        <SuiteCard
                          key={s.id} suite={s} allTests={tests}
                          expanded={expSuite === s.id}
                          onToggle={() => setExpSuite(expSuite === s.id ? null : s.id)}
                          onEdit={(data) => setSuites((p) => p.map((su) => su.id === s.id ? { ...su, name: data.name, freq: data.freq, tests: data.tests } : su))}
                        />
                      ))}
                      {relatedSuites.length === 0 && !showBuilder && (
                        <div className="py-8 text-[13px] text-center rounded-xl" style={{ color: colors.t5, background: colors.canvas }}>
                          No suites contain probes from this endpoint
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ PIPELINES ═══ */}
      {topTab === "pipelines" && <PipelinesView suites={suites} setSuites={setSuites} tests={tests} />}
    </div>
  );
}
