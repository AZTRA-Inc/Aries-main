"use client";

// ═══════════════════════════════════════
// Aries — Design Tokens
// ═══════════════════════════════════════

export const colors = {
  bg: "#FFFFFF",
  canvas: "#F8FAFC",
  surface: "#F1F5F9",
  surfaceH: "#E2E8F0",
  border: "#E2E8F0",
  borderH: "#CBD5E1",
  t1: "#0F172A",
  t2: "#334155",
  t3: "#64748B",
  t4: "#94A3B8",
  t5: "#CBD5E1",
  green: "#059669",
  red: "#DC2626",
  amber: "#B45309",
  blue: "#2563EB",
  purple: "#7C3AED",
};

export const METHOD_STYLES = {
  GET:     { bg: "#EEF2FF90", border: "#E0E7FF" },
  POST:    { bg: "#ECFDF590", border: "#D1FAE5" },
  PUT:     { bg: "#FFFBEB90", border: "#FEF3C7" },
  DELETE:  { bg: "#FEF2F290", border: "#FEE2E2" },
  PATCH:   { bg: "#F5F3FF90", border: "#EDE9FE" },
  HEAD:    { bg: "#F1F5F990", border: "#E2E8F0" },
  OPTIONS: { bg: "#F1F5F990", border: "#E2E8F0" },
};

export const FREQ_COLORS = {
  Hourly:      { color: colors.red,    bg: colors.red + "10",    border: colors.red + "20" },
  Daily:       { color: colors.blue,   bg: colors.blue + "10",   border: colors.blue + "20" },
  Weekly:      { color: colors.purple, bg: colors.purple + "10", border: colors.purple + "20" },
  "Bi-Weekly": { color: colors.amber,  bg: colors.amber + "10",  border: colors.amber + "20" },
  "On Deploy": { color: colors.t2,     bg: colors.surface,       border: colors.border },
};

export const TYPE_COLORS = {
  string: colors.green,
  integer: colors.blue,
  number: colors.blue,
  boolean: colors.purple,
  array: colors.amber,
  object: colors.t1,
  uuid: colors.t3,
  "date-time": colors.t3,
  email: colors.t3,
  enum: colors.t3,
};

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
