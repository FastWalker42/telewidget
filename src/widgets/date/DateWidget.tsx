import type { DatePayload } from "../../lib/payload";
import { encodeResult } from "../../lib/payload";
import { submitAndClose, hapticNotification } from "../../lib/tma";
import { resolveStyle, cardClass, pageProps, buttonStyle } from "../../lib/style";
import { ScrollPicker } from "../../components/ScrollPicker";
import { DatePicker } from "../../components/DatePicker";
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
    <div {...pageProps(s.tint, s.liquidGlass)}>
      <div class={`w-full max-w-sm ${cardClass(s.liquidGlass)}`}>
        <h2 class="text-xl font-semibold tracking-tight text-gray-900">
          {MODE_TITLE[payload.mode]}
        </h2>

        {showDate && !showDateEnd && (
          <DatePicker value={date} onChange={setDate} accent={s.accent} />
        )}

        {showDateEnd && (
          <>
            <DatePicker value={date} onChange={setDate} accent={s.accent} label="From" />
            <DatePicker value={dateEnd} onChange={setDateEnd} accent={s.accent} label="To" />
          </>
        )}

        {showTime && (
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-widest text-gray-400">Time</span>
            <div class="flex items-center justify-center gap-1 rounded-2xl bg-black/5 py-2">
              <ScrollPicker items={HOURS} value={hours} onChange={setHours} width="72px" />
              <span class="text-2xl font-semibold text-gray-300 pb-0.5 select-none">:</span>
              <ScrollPicker items={MINUTES} value={minutes} onChange={setMinutes} width="72px" />
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
