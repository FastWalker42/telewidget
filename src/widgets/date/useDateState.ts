import { useState } from "preact/hooks";
import type { DateMode } from "../../lib/payload";

export function useDateState(mode: DateMode) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [hours, setHours] = useState(String(now.getHours()).padStart(2, "0"));
  const [minutes, setMinutes] = useState(String(now.getMinutes()).padStart(2, "0"));
  const [dateEnd, setDateEnd] = useState(today);

  function buildResult(): string {
    switch (mode) {
      case "date":
        return date;
      case "time":
        return `${hours}_${minutes}`;
      case "datetime":
        return `${date}_${hours}_${minutes}`;
      case "date-range":
        return `${date}_${dateEnd}`;
    }
  }

  return { date, setDate, hours, setHours, minutes, setMinutes, dateEnd, setDateEnd, buildResult };
}
