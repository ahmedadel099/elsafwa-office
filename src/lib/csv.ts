/** Download rows as a UTF-8 (with BOM) CSV so Excel opens Arabic text correctly. */
export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>): void {
  const escape = (cell: string | number) => {
    const text = String(cell);
    // Neutralise spreadsheet formula injection (cells starting with = + - @).
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const content = '﻿' + [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
