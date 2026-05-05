import type { DatePayload } from "../../lib/payload";
import { encodeResult } from "../../lib/payload";
import { submitAndClose, hapticNotification } from "../../lib/tma";
import { useResolvedStyle, cardClass, pageProps, buttonStyle } from "../../lib/style";
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
  "time-range": "Select Time Range",
};

function TimePicker({ label, hours, minutes, setHours, setMinutes, theme }: {
  label?: string;
  hours: string;
  minutes: string;
  setHours: (v: string) => void;
  setMinutes: (v: string) => void;
  theme?: import("../../lib/style").Theme;
}) {
  return (
    <div class="flex flex-col gap-2">
      {label && <span class="text-xs font-semibold uppercase tracking-widest" style={{ color: theme?.textMuted ?? "#8E8E93" }}>{label}</span>}
      <div class="flex items-center justify-center gap-1 rounded-2xl py-2" style={{ backgroundColor: theme?.surface ?? "rgba(0,0,0,0.06)" }}>
        <ScrollPicker items={HOURS} value={hours} onChange={setHours} width="72px" theme={theme} />
        <span class="text-2xl font-semibold pb-0.5 select-none" style={{ color: theme?.separator ?? "rgba(0,0,0,0.15)" }}>:</span>
        <ScrollPicker items={MINUTES} value={minutes} onChange={setMinutes} width="72px" theme={theme} />
      </div>
    </div>
  );
}

export function DateWidget({ payload }: Props) {
  const s = useResolvedStyle(payload.style);
  const {
    date, setDate, hours, setHours, minutes, setMinutes,
    dateEnd, setDateEnd, hoursEnd, setHoursEnd, minutesEnd, setMinutesEnd,
    buildResult,
  } = useDateState(payload.mode, payload.format, payload.order);

  const showDate = payload.mode !== "time" && payload.mode !== "time-range";
  const showTime = payload.mode === "time" || payload.mode === "datetime";
  const showDateEnd = payload.mode === "date-range";
  const showTimeRange = payload.mode === "time-range";

  function handleConfirm() {
    hapticNotification("success");
    submitAndClose(encodeResult(payload, buildResult()));
  }

  return (
    <div {...pageProps(s.tint, s.liquidGlass, s.dark)}>
      <div class={`w-full max-w-sm ${cardClass(s.liquidGlass, s.dark)}`}>
        <h2 class="text-xl font-semibold tracking-tight" style={{ color: s.theme.text }}>
          {MODE_TITLE[payload.mode]}
        </h2>

        {showDate && !showDateEnd && (
          <DatePicker value={date} onChange={setDate} accent={s.accent} theme={s.theme} />
        )}

        {showDateEnd && (
          <>
            <DatePicker value={date} onChange={setDate} accent={s.accent} label="From" theme={s.theme} />
            <DatePicker value={dateEnd} onChange={setDateEnd} accent={s.accent} label="To" theme={s.theme} />
          </>
        )}

        {showTime && (
          <TimePicker hours={hours} minutes={minutes} setHours={setHours} setMinutes={setMinutes} theme={s.theme} />
        )}

        {showTimeRange && (
          <>
            <TimePicker label="From" hours={hours} minutes={minutes} setHours={setHours} setMinutes={setMinutes} theme={s.theme} />
            <TimePicker label="To" hours={hoursEnd} minutes={minutesEnd} setHours={setHoursEnd} setMinutes={setMinutesEnd} theme={s.theme} />
          </>
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
