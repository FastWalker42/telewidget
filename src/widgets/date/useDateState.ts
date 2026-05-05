import { useState } from "preact/hooks";
import type { DateMode, DateFormat, DateOrder } from "../../lib/payload";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDate(date: string, order: DateOrder): string {
  const [y, m, d] = date.split("-");
  switch (order) {
    case "ymd": return `${y}-${m}-${d}`;
    case "dmy": return `${d}-${m}-${y}`;
    case "mdy": return `${m}-${d}-${y}`;
  }
}

function toUnix(date: string, hours: string, minutes: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y!, m! - 1, d!, Number(hours), Number(minutes)).getTime();
}

export function useDateState(mode: DateMode, format: DateFormat = "default", order: DateOrder = "ymd") {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [hours, setHours] = useState(pad(now.getHours()));
  const [minutes, setMinutes] = useState(pad(now.getMinutes()));
  const [dateEnd, setDateEnd] = useState(today);
  const [hoursEnd, setHoursEnd] = useState(pad(now.getHours()));
  const [minutesEnd, setMinutesEnd] = useState(pad(now.getMinutes()));

  function buildResult(): string {
    const div = format === "unix-s" ? 1000 : 1;

    switch (mode) {
      case "date":
        if (format !== "default") return String(Math.floor(toUnix(date, "00", "00") / div));
        return formatDate(date, order);
      case "time":
        if (format !== "default") return String(Math.floor(toUnix(date, hours, minutes) / div));
        return `${hours}-${minutes}`;
      case "datetime":
        if (format !== "default") return String(Math.floor(toUnix(date, hours, minutes) / div));
        return `${formatDate(date, order)}_${hours}-${minutes}`;
      case "date-range":
        if (format !== "default") {
          const a = Math.floor(toUnix(date, "00", "00") / div);
          const b = Math.floor(toUnix(dateEnd, "00", "00") / div);
          return `${a}_${b}`;
        }
        return `${formatDate(date, order)}_${formatDate(dateEnd, order)}`;
      case "time-range":
        if (format !== "default") {
          const a = Math.floor(toUnix(date, hours, minutes) / div);
          const b = Math.floor(toUnix(date, hoursEnd, minutesEnd) / div);
          return `${a}_${b}`;
        }
        return `${hours}-${minutes}_${hoursEnd}-${minutesEnd}`;
    }
  }

  return {
    date, setDate,
    hours, setHours,
    minutes, setMinutes,
    dateEnd, setDateEnd,
    hoursEnd, setHoursEnd,
    minutesEnd, setMinutesEnd,
    buildResult,
  };
}
