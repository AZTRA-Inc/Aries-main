"use client";

import { colors, TYPE_COLORS } from "@/lib/tokens";
import { Pill, TypeBadge } from "./ui";

// ═══════════════════════════════════════
// Tree View — Schema fields as a tree
// ═══════════════════════════════════════
export function TreeView({ schema, method, path }) {
  const defaultValue = (type) => {
    const map = { string: '"..."', integer: "0", number: "0.0", boolean: "true", array: "[ ]", object: "{ }", uuid: '"uuid"', "date-time": '"ISO-8601"', email: '"email"', enum: '"enum"' };
    return map[type] || "null";
  };

  return (
    <div className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-[11px] font-semibold uppercase" style={{ color: colors.t4, letterSpacing: 0.5 }}>
          Schema Tree · {schema.length} fields
        </span>
        <div className="flex-1" />
        <Pill text={`${schema.filter((f) => f.required).length} required`} color={colors.t3} />
      </div>

      <div className="overflow-hidden" style={{ border: `1px solid ${colors.border}`, borderRadius: 12 }}>
        {/* Root node */}
        <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: colors.canvas, borderBottom: `1px solid ${colors.border}` }}>
          <svg width="14" height="14" fill="none" stroke={colors.t3} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="font-mono text-xs font-bold" style={{ color: colors.t1 }}>{method} {path}</span>
          <span className="font-mono text-[10px]" style={{ color: colors.t4 }}>object</span>
        </div>

        {/* Field rows */}
        {schema.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-2 py-2 pr-3.5 transition-colors hover:bg-slate-50"
            style={{ paddingLeft: 36, borderBottom: i < schema.length - 1 ? `1px solid ${colors.border}` : "none" }}
          >
            <span className="w-3 h-px" style={{ background: colors.t5 }} />
            <span className="font-mono text-xs font-semibold" style={{ color: colors.t1 }}>{f.name}</span>
            <TypeBadge type={f.type} />
            {f.required && (
              <span className="text-[9px] font-bold uppercase" style={{ color: colors.red, letterSpacing: 0.3 }}>req</span>
            )}
            <div className="flex-1" />
            <span className="font-mono text-[10px]" style={{ color: colors.t5 }}>{defaultValue(f.type)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Raw View — JSON code block
// ═══════════════════════════════════════
export function RawView({ schema, method, path, time, fieldCount }) {
  let json = "{\n";
  schema.forEach((f, i) => {
    const val = { string: '"example_value"', integer: "0", number: "0.0", boolean: "true", array: "[]", object: "{}", uuid: '"550e8400-e29b-41d4-a716-446655440000"', "date-time": '"2025-01-15T09:30:00Z"', email: '"user@example.com"', enum: '"active"' }[f.type] || "null";
    json += `  "${f.name}": ${val}${i < schema.length - 1 ? "," : ""}\n`;
  });
  json += "}";

  return (
    <div className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-[11px] font-semibold uppercase" style={{ color: colors.t4, letterSpacing: 0.5 }}>Raw Schema</span>
        <div className="flex-1" />
        <Pill text={method} />{" "}
        <Pill text={time} />{" "}
        <Pill text={`${fieldCount} fields`} />
      </div>
      <pre
        className="font-mono text-xs leading-relaxed overflow-auto m-0 max-h-[500px]"
        style={{ background: colors.t1, color: "#E2E8F0", padding: 16, borderRadius: 12 }}
      >
        <span style={{ color: colors.t4 }}>{`// ${method} ${path}\n`}</span>
        <span style={{ color: colors.t4 }}>{`// Response Schema\n\n`}</span>
        {json}
      </pre>
    </div>
  );
}
