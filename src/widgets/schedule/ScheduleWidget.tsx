import { useState } from "preact/hooks";
import type { SchedulePayload } from "../../lib/payload";
import { encodeResult } from "../../lib/payload";
import { submitAndClose, hapticNotification, hapticImpact } from "../../lib/tma";
import { useResolvedStyle, cardClass, pageProps, buttonStyle } from "../../lib/style";
import { ScrollPicker } from "../../components/ScrollPicker";
import { Toggle } from "../../components/Toggle";

interface Props {
  payload: SchedulePayload;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function pad2(n: number | string) {
  return String(n).padStart(2, "0");
}

interface DaySlot {
  enabled: boolean;
  fromH: string;
  fromM: string;
  toH: string;
  toM: string;
}

function defaultSlot(): DaySlot {
  return { enabled: false, fromH: "09", fromM: "00", toH: "18", toM: "00" };
}

function encodeBunch(slots: DaySlot[]): string {
  return slots
    .map((s) =>
      s.enabled
        ? `${s.fromH}${s.fromM}${s.toH}${s.toM}`
        : "00000000"
    )
    .join("");
}

function DayRow({
  day,
  slot,
  expanded,
  onToggle,
  onExpand,
  onChange,
  accent,
  theme,
}: {
  day: string;
  slot: DaySlot;
  expanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onChange: (patch: Partial<DaySlot>) => void;
  accent: string;
  theme: import("../../lib/style").Theme;
}) {
  return (
    <div class="flex flex-col border-b" style={{ borderColor: theme.separator }}>
      <div class="flex items-center gap-3 py-2">
        <Toggle size="sm" value={slot.enabled} onChange={() => onToggle()} />

        <span
          class="text-sm font-medium w-8 shrink-0"
          style={{ color: slot.enabled ? theme.text : theme.textMuted }}
        >
          {day}
        </span>

        {slot.enabled ? (
          <button
            onClick={() => { hapticImpact("light"); onExpand(); }}
            class="flex-1 text-left text-sm font-mono transition-colors"
            style={{ color: accent }}
          >
            {slot.fromH}:{slot.fromM} – {slot.toH}:{slot.toM}
          </button>
        ) : (
          <span class="flex-1 text-sm" style={{ color: theme.separator }}>Off</span>
        )}
      </div>

      {slot.enabled && expanded && (
        <div class="flex items-center justify-center gap-3 rounded-2xl py-2 mb-2" style={{ backgroundColor: theme.surface }}>
          <div class="flex items-center gap-1">
            <ScrollPicker items={HOURS} value={slot.fromH} onChange={(v) => onChange({ fromH: v })} width="60px" theme={theme} />
            <span class="text-xl font-semibold pb-0.5 select-none" style={{ color: theme.separator }}>:</span>
            <ScrollPicker items={MINUTES} value={slot.fromM} onChange={(v) => onChange({ fromM: v })} width="60px" theme={theme} />
          </div>
          <span class="text-sm font-medium" style={{ color: theme.textMuted }}>–</span>
          <div class="flex items-center gap-1">
            <ScrollPicker items={HOURS} value={slot.toH} onChange={(v) => onChange({ toH: v })} width="60px" theme={theme} />
            <span class="text-xl font-semibold pb-0.5 select-none" style={{ color: theme.separator }}>:</span>
            <ScrollPicker items={MINUTES} value={slot.toM} onChange={(v) => onChange({ toM: v })} width="60px" theme={theme} />
          </div>
        </div>
      )}
    </div>
  );
}

export function ScheduleWidget({ payload }: Props) {
  const s = useResolvedStyle(payload.style);
  const [slots, setSlots] = useState<DaySlot[]>(() => DAYS.map(defaultSlot));
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  function patchSlot(i: number, patch: Partial<DaySlot>) {
    setSlots((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }

  function handleConfirm() {
    hapticNotification("success");
    submitAndClose(encodeResult(payload, encodeBunch(slots)));
  }

  return (
    <div {...pageProps(s.tint, s.liquidGlass, s.dark)}>
      <div class={`w-full max-w-sm ${cardClass(s.liquidGlass, s.dark)}`}>
        <h2 class="text-xl font-semibold tracking-tight" style={{ color: s.theme.text }}>Weekly Schedule</h2>

        <div class="flex flex-col">
          {DAYS.map((day, i) => (
            <DayRow
              key={day}
              day={day}
              slot={slots[i]!}
              expanded={expandedDay === i}
              accent={s.accent}
              theme={s.theme}
              onToggle={() => {
                patchSlot(i, { enabled: !slots[i]!.enabled });
                if (!slots[i]!.enabled) setExpandedDay(i);
                else if (expandedDay === i) setExpandedDay(null);
              }}
              onExpand={() => setExpandedDay(expandedDay === i ? null : i)}
              onChange={(patch) => patchSlot(i, patch)}
            />
          ))}
        </div>

        <button
          onClick={handleConfirm}
          style={buttonStyle(s.accent)}
          class="mt-1 w-full rounded-2xl py-4 text-base font-semibold text-white shadow-lg active:scale-95 transition-all duration-150"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
