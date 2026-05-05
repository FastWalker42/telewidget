import { hapticImpact } from "../lib/tma";
import type { Theme } from "../lib/style";

interface Props {
  year: number;
  month: number;
  day: number;
  onChange: (year: number, month: number, day: number) => void;
  accent: string;
  theme?: Theme;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function shiftMonth(year: number, month: number, delta: number): [number, number] {
  const d = new Date(year, month - 1 + delta, 1);
  return [d.getFullYear(), d.getMonth() + 1];
}

export function CalendarGrid({ year, month, day, onChange, accent, theme }: Props) {
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function navigate(delta: number) {
    hapticImpact("light");
    const [ny, nm] = shiftMonth(year, month, delta);
    onChange(ny, nm, Math.min(day, new Date(ny, nm, 0).getDate()));
  }

  return (
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between px-1">
        <button
          onClick={() => navigate(-1)}
          class="flex h-7 w-7 items-center justify-center rounded-full active:scale-90 transition-all"
          style={{ color: theme?.textMuted ?? "#8E8E93" }}
        >
          ‹
        </button>
        <span class="text-sm font-semibold" style={{ color: theme?.text ?? "#111111" }}>
          {MONTHS[month - 1]} {year}
        </span>
        <button
          onClick={() => navigate(1)}
          class="flex h-7 w-7 items-center justify-center rounded-full active:scale-90 transition-all"
          style={{ color: theme?.textMuted ?? "#8E8E93" }}
        >
          ›
        </button>
      </div>

      <div class="grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <div key={d} class="flex h-7 items-center justify-center text-xs font-medium" style={{ color: theme?.textMuted ?? "#8E8E93" }}>
            {d}
          </div>
        ))}

        {cells.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} />;

          const isSelected = d === day;
          const isToday =
            d === today.getDate() &&
            month === today.getMonth() + 1 &&
            year === today.getFullYear();

          return (
            <button
              key={d}
              onClick={() => {
                hapticImpact("light");
                onChange(year, month, d);
              }}
              class="flex h-8 w-full items-center justify-center rounded-full text-sm font-medium transition-all active:scale-90"
              style={
                isSelected
                  ? { backgroundColor: accent, color: "#ffffff" }
                  : isToday
                  ? { backgroundColor: theme?.surface ?? "rgba(0,0,0,0.06)", color: theme?.text ?? "#111111", fontWeight: "700" }
                  : { color: theme?.text ?? "#111111" }
              }
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
