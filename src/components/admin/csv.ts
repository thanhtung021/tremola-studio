/** RFC 4180 CSV with a UTF-8 BOM so Excel opens Vietnamese text correctly. */
export function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const cell = (v: unknown) => {
    if (v === null || v === undefined) return "";
    let s = String(v);
    // Neutralise spreadsheet formula injection from visitor-supplied text.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(","), ...rows.map((r) => columns.map((c) => cell(r[c])).join(","))];
  return "﻿" + lines.join("\r\n");
}
