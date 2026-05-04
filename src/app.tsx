import { useEffect, useState } from "preact/hooks";
import { parsePayload, type WidgetPayload } from "./lib/payload";
import { tmaReady } from "./lib/tma";
import { DateWidget } from "./widgets/date/DateWidget";
import { ColorWidget } from "./widgets/color/ColorWidget";

export function App() {
  const [payload, setPayload] = useState<WidgetPayload | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    tmaReady();
    const p = parsePayload();
    if (!p) setError(true);
    else setPayload(p);
  }, []);

  if (error) {
    return (
      <div class="flex min-h-screen items-center justify-center bg-gray-50">
        <p class="text-gray-400 text-sm">Invalid or missing payload.</p>
      </div>
    );
  }

  if (!payload) return null;

  if (payload.widget === "date") {
    return <DateWidget payload={payload} />;
  }

  if (payload.widget === "color") {
    return <ColorWidget payload={payload} />;
  }

  return null;
}
