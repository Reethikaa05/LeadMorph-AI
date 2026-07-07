"use client";

import { useMemo } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";

const VIRTUALIZE_THRESHOLD = 150;
const ROW_HEIGHT = 46;
const MAX_BODY_HEIGHT = 440;

function columnWidth(header: string) {
  return Math.min(260, Math.max(150, header.length * 9 + 48));
}

export interface DataTableProps {
  columns: string[];
  rows: Record<string, any>[];
  renderCell?: (column: string, row: Record<string, any>) => React.ReactNode;
  emptyMessage?: string;
}

export function DataTable({ columns, rows, renderCell, emptyMessage }: DataTableProps) {
  const widths = useMemo(() => columns.map(columnWidth), [columns]);
  const totalWidth = useMemo(() => widths.reduce((a, b) => a + b, 0), [widths]);

  if (rows.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-sm text-slate-400">{emptyMessage || "No data to display yet."}</p>
      </div>
    );
  }

  function renderRow(index: number, style: React.CSSProperties) {
    const row = rows[index];
    return (
      <div
        style={style}
        className={`flex items-center border-b border-black/5 dark:border-white/5 text-sm transition-colors hover:bg-brand-500/[0.04] ${
          index % 2 === 0 ? "bg-transparent" : "bg-black/[0.015] dark:bg-white/[0.015]"
        }`}
      >
        {columns.map((col, i) => (
          <div
            key={col}
            style={{ width: widths[i], minWidth: widths[i] }}
            className="truncate px-4 py-2.5 text-slate-700 dark:text-slate-300"
            title={String(row[col] ?? "")}
          >
            {renderCell ? renderCell(col, row) : String(row[col] ?? "—")}
          </div>
        ))}
      </div>
    );
  }

  const Row = ({ index, style }: ListChildComponentProps) => renderRow(index, style);

  const shouldVirtualize = rows.length > VIRTUALIZE_THRESHOLD;
  const bodyHeight = Math.min(MAX_BODY_HEIGHT, rows.length * ROW_HEIGHT);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: totalWidth }}>
          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex border-b border-black/10 dark:border-white/10 bg-slate-50/95 dark:bg-[#150f28]/95 backdrop-blur">
            {columns.map((col, i) => (
              <div
                key={col}
                style={{ width: widths[i], minWidth: widths[i] }}
                className="truncate px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                {col}
              </div>
            ))}
          </div>

          {/* Body: virtualized for large datasets, plain for small */}
          {shouldVirtualize ? (
            <FixedSizeList
              height={bodyHeight}
              width="100%"
              itemCount={rows.length}
              itemSize={ROW_HEIGHT}
              style={{ overflowX: "hidden" }}
            >
              {Row}
            </FixedSizeList>
          ) : (
            <div style={{ maxHeight: MAX_BODY_HEIGHT }} className="overflow-y-auto">
              {rows.map((_, index) => (
                <div key={index}>{renderRow(index, {})}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 px-4 py-2.5 text-xs text-slate-400">
        <span>{rows.length.toLocaleString()} rows</span>
        {shouldVirtualize && <span>Virtualized rendering enabled for smooth scrolling</span>}
      </div>
    </div>
  );
}
