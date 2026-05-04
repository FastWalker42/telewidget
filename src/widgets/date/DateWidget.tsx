import type { DatePayload } from "../../lib/payload";
import { encodeResult } from "../../lib/payload";
import { submitAndClose, hapticImpact, hapticNotification } from "../../lib/tma";
import { resolveStyle, cardClass, pageClass, pageStyle, buttonStyle } from "../../lib/style";
import { ScrollPicker } from "../../components/ScrollPicker";
import { useDateState } from "./useDateState";

interface Props {
  payload: DatePayload;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const MODE_TITLE: Record<string, string> = {
  date: "Select Date",
  time: "Select Time",
  datetime: "Select Date & Time",
  "date-range": "Select Date Range",
};

export function DateWidget({ payload }: Props) {
  const s = resolveStyle(payload.style);
  const { date, setDate, hours, setHours, minutes, setMinutes, dateEnd, setDateEnd, buildResult } =
    useDateState(payload.mode);

  const showDate = payload.mode !== "time";
  const showTime = payload.mode === "time" || payload.mode === "datetime";
  const showDateEnd = payload.mode === "date-range";

  function handleConfirm() {
    hapticNotification("success");
    submitAndClose(encodeResult(payload, buildResult()));
  }

  return (
    <div
      class={pageClass(s.tint, s.liquidGlass)}
      style={pageStyle(s.tint, s.liquidGlass)}
    >
      <div class={`w-full max-w-sm ${cardClass(s.liquidGlass)}`}>
        <h2 class="text-xl font-semibold tracking-tight text-gray-900">
          {MODE_TITLE[payload.mode]}
        </h2>

        {showDate && (
          <label class="flex flex-col gap-2">
            {showDateEnd && (
              <span class="text-xs font-semibold uppercase tracking-widest text-gray-400">From</span>
            )}
            <input
              type="date"
              value={date}
              onInput={(e) => {
                hapticImpact("light");
                setDate((e.target as HTMLInputElement).value);
              }}
              class="w-full rounded-2xl border-0 bg-black/5 px-4 py-3 text-base text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/40 transition"
            />
          </label>
        )}

        {showDateEnd && (
          <label class="flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-widest text-gray-400">To</span>
            <input
              type="date"
              value={dateEnd}
              min={date}
              onInput={(e) => {
                hapticImpact("light");
                setDateEnd((e.target as HTMLInputElement).value);
              }}
              class="w-full rounded-2xl border-0 bg-black/5 px-4 py-3 text-base text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/40 transition"
            />
          </label>
        )}

        {showTime && (
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-widest text-gray-400">Time</span>
            <div class="flex items-center justify-center gap-1 rounded-2xl bg-black/5 py-2">
              <ScrollPicker
                items={HOURS}
                value={hours}
                onChange={setHours}
                width="72px"
              />
              <span class="text-2xl font-semibold text-gray-400 pb-0.5">:</span>
              <ScrollPicker
                items={MINUTES}
                value={minutes}
                onChange={setMinutes}
                width="72px"
              />
            </div>
          </div>
        )}

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
