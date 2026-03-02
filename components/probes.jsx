"use client";

import { colors } from "@/lib/tokens";
import { StatusDot, AiBadge, ConfBadge, Stepper, Button, ApproveRejectBtns } from "./ui";

// ═══════════════════════════════════════
// Probe Row — Approved / Pending / Rejected states
// ═══════════════════════════════════════
export function ProbeRow({ t, onApprove, onReject, onReset, onUpdatePos, onUpdateNeg, expanded, onToggle }) {
  const isPend = t.review === "pending";
  const isApp = t.review === "approved";
  const isRej = t.review === "rejected";

  const borderColor = isPend ? "#D97706" : isApp ? colors.green : "transparent";
  const dotColor = isApp ? colors.green : isPend ? "#D97706" : null;

  return (
    <div
      className="transition-opacity duration-150"
      style={{
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: "0 6px 6px 0",
        opacity: isRej ? 0.4 : 1,
      }}
    >
      {/* Collapsed row */}
      <div
        onClick={onToggle}
        className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer rounded-md transition-colors hover:bg-slate-50"
      >
        <StatusDot color={dotColor} hollow={isRej} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[13px] font-medium truncate"
              style={{
                color: isRej ? colors.t4 : colors.t1,
                textDecoration: isRej ? "line-through" : "none",
              }}
            >
              {t.name}
            </span>
            {t.aiGenerated && <AiBadge />}
          </div>
        </div>
        <ConfBadge value={t.aiConf} />

        {isPend && <ApproveRejectBtns onApprove={onApprove} onReject={onReject} />}
        {!isPend && (
          <button
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="text-[11px] font-medium transition-colors hover:text-slate-700"
            style={{ border: "none", background: "transparent", color: colors.t5 }}
          >
            Undo
          </button>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-0" style={{ paddingLeft: 44, borderTop: `1px solid ${colors.border}` }}>
          {/* AI Description */}
          <div
            className="flex items-start gap-2 my-2.5 p-2.5 rounded-lg"
            style={{ background: colors.purple + "08", border: `1px solid ${colors.purple}12` }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2" className="mt-0.5 shrink-0">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            <div>
              <div className="text-[9px] font-bold uppercase mb-0.5" style={{ color: colors.purple, letterSpacing: 0.5 }}>
                AI-Generated Description
              </div>
              <p className="text-xs leading-relaxed m-0" style={{ color: colors.t2 }}>
                {t.desc}
              </p>
            </div>
          </div>

          {/* Stepper + Confidence */}
          <div
            className="flex items-center gap-3.5 p-2.5 rounded-lg mb-2.5"
            style={{ background: colors.canvas }}
            onClick={(e) => e.stopPropagation()}
          >
            <Stepper value={t.pos} onChange={onUpdatePos} min={0} label="Pos" />
            <Stepper value={t.neg} onChange={onUpdateNeg} min={0} label="Neg" />
            <div className="w-px h-5" style={{ background: colors.border }} />
            <span className="text-[10px] font-semibold uppercase" style={{ color: colors.t4, letterSpacing: 0.4 }}>
              Conf
            </span>
            <ConfBadge value={t.aiConf} />
          </div>

          {/* Action buttons */}
          {isPend && (
            <div className="flex gap-1.5">
              <Button onClick={onApprove}>Approve</Button>
              <Button onClick={onReject} variant="secondary">Reject</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Review Strip — Approval progress bar
// ═══════════════════════════════════════
export function ReviewStrip({ tests, onApproveAll }) {
  const ap = tests.filter((t) => t.review === "approved").length;
  const pe = tests.filter((t) => t.review === "pending").length;
  const re = tests.filter((t) => t.review === "rejected").length;
  if (!tests.length) return null;

  return (
    <div className="px-4">
      <div className="flex items-center gap-3.5 py-2.5 text-xs">
        {ap > 0 && (
          <span className="font-semibold flex items-center gap-1.5" style={{ color: colors.green }}>
            <StatusDot color={colors.green} size={7} /> {ap} approved
          </span>
        )}
        {pe > 0 && (
          <span className="font-semibold flex items-center gap-1.5" style={{ color: "#D97706" }}>
            <StatusDot color="#D97706" size={7} /> {pe} pending
          </span>
        )}
        {re > 0 && (
          <span className="font-semibold flex items-center gap-1.5" style={{ color: colors.t4 }}>
            <StatusDot color={colors.t5} size={7} /> {re}
          </span>
        )}
        <div className="flex-1" />
        {pe > 0 && (
          <Button onClick={onApproveAll} size="sm">
            Approve All {pe}
          </Button>
        )}
      </div>
      <div className="flex gap-px h-[3px] rounded-full overflow-hidden mb-2" style={{ background: colors.surface }}>
        {ap > 0 && <div style={{ flex: ap, background: colors.green }} />}
        {pe > 0 && <div style={{ flex: pe, background: "#D97706" }} />}
        {re > 0 && <div style={{ flex: re, background: colors.surfaceH }} />}
      </div>
    </div>
  );
}
