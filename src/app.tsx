import { useEffect, useState } from "preact/hooks";
import { parsePayload, type WidgetPayload } from "./lib/payload";
import { tmaReady } from "./lib/tma";
import { DateWidget } from "./widgets/date/DateWidget";
import { ColorWidget } from "./widgets/color/ColorWidget";
import { ScheduleWidget } from "./widgets/schedule/ScheduleWidget";
import { BuilderPage } from "./builder/BuilderPage";

export function App() {
  const [payload, setPayload] = useState<WidgetPayload | null | "none">(null);

  useEffect(() => {
    tmaReady();
    const p = parsePayload();
    setPayload(p ?? "none");
  }, []);

  if (payload === null) return null;

  if (payload === "none") return <BuilderPage />;

  if (payload.widget === "date") return <DateWidget payload={payload} />;
  if (payload.widget === "color") return <ColorWidget payload={payload} />;
  if (payload.widget === "schedule") return <ScheduleWidget payload={payload} />;

  return null;
}
