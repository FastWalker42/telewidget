import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { ScrollPicker } from "./ScrollPicker";
import { CalendarGrid } from "./CalendarGrid";
import { hapticImpact } from "../lib/tma";
import type { Theme } from "../lib/style";

interface Props {
  value: string;
  onChange: (value: string) => void;
  accent: string;
  label?: string;
  theme?: Theme;
}

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseDate(value: string): [number, number, number] {
  const [y, m, d] = value.split("-").map(Number);
  return [y ?? new Date().getFullYear(), m ?? 1, d ?? 1];
}

export function DatePicker({ value, onChange, accent, label, theme }: Props) {
  const [gridMode, setGridMode] = useState(false);
  const [containerH, setContainerH] = useState<number | null>(null);
  const wheelsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [year, month, day] = parseDate(value);

  const days = useMemo(
    () => Array.from({ length: daysInMonth(year, month) }, (_, i) => pad(i + 1)),
    [year, month],
  );
  const months = MONTHS_SHORT;
  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 30 }, (_, i) => String(cur - 5 + i));
  }, []);

  function emit(y: number, m: number, d: number) {
    const clamped = Math.min(d, daysInMonth(y, m));
    onChange(`${y}-${pad(m)}-${pad(clamped)}`);
  }

  // measure and update container height whenever mode or content changes
  useEffect(() => {
    const el = gridMode ? gridRef.current : wheelsRef.current;
    if (!el) return;
    setContainerH(el.offsetHeight);
  }, [gridMode, month, year]);

  // on first render measure wheels height
  useEffect(() => {
    if (wheelsRef.current) setContainerH(wheelsRef.current.offsetHeight);
  }, []);

  function toggle() {
    // snapshot current height before switching so transition starts from it
    const current = gridMode ? gridRef.current : wheelsRef.current;
    if (current) setContainerH(current.offsetHeight);

    hapticImpact("light");
    setGridMode((v) => !v);
  }

  return (
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        {label && (
          <span class="text-xs font-semibold uppercase tracking-widest" style={{ color: theme?.textMuted ?? "#8E8E93" }}>
            {label}
          </span>
        )}
        <button
          onClick={toggle}
          class="ml-auto flex h-7 w-7 items-center justify-center rounded-lg active:scale-90 transition-all"
          style={{ color: theme?.textMuted ?? "#8E8E93" }}
          title={gridMode ? "Switch to wheels" : "Switch to calendar"}
        >
          {gridMode ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="3" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="13" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="3" cy="3" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
              <circle cx="13" cy="3" r="1.5" fill="currentColor"/>
              <circle cx="3" cy="13" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
              <circle cx="13" cy="13" r="1.5" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M1 7h14" stroke="currentColor" stroke-width="1.5"/>
              <path d="M5 1v4M11 1v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* animated height container */}
      <div
        class="relative overflow-hidden"
        style={{
          height: containerH != null ? `${containerH}px` : "auto",
          transition: "height 350ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* wheels */}
        <div
          ref={wheelsRef}
          class="absolute inset-x-0 top-0"
          style={{
            opacity: gridMode ? 0 : 1,
            pointerEvents: gridMode ? "none" : "auto",
            transition: "opacity 250ms ease",
          }}
        >
          <div class="flex items-center justify-center gap-1 rounded-2xl py-2" style={{ backgroundColor: theme?.surface ?? "rgba(0,0,0,0.06)" }}>
            <ScrollPicker items={days} value={pad(day)} onChange={(v) => emit(year, month, parseInt(v))} width="52px" theme={theme} />
            <ScrollPicker items={months} value={months[month - 1]!} onChange={(v) => emit(year, MONTHS_SHORT.indexOf(v) + 1, day)} width="96px" theme={theme} />
            <ScrollPicker items={years} value={String(year)} onChange={(v) => emit(parseInt(v), month, day)} width="72px" theme={theme} />
          </div>
        </div>

        {/* grid */}
        <div
          ref={gridRef}
          class="absolute inset-x-0 top-0"
          style={{
            opacity: gridMode ? 1 : 0,
            pointerEvents: gridMode ? "auto" : "none",
            transition: "opacity 250ms ease",
          }}
        >
          <div class="rounded-2xl px-3 py-3" style={{ backgroundColor: theme?.surface ?? "rgba(0,0,0,0.06)" }}>
            <CalendarGrid year={year} month={month} day={day} onChange={(y, m, d) => emit(y, m, d)} accent={accent} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}
