import { useState } from "preact/hooks";
import type { ColorPayload } from "../../lib/payload";
import { encodeResult } from "../../lib/payload";
import { submitAndClose, hapticImpact, hapticNotification } from "../../lib/tma";
import { resolveStyle, cardClass, pageClass, pageStyle, buttonStyle } from "../../lib/style";

interface Props {
  payload: ColorPayload;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}_${g}_${b}`;
}

function hexToHsl(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)}_${Math.round(s * 100)}_${Math.round(l * 100)}`;
}

function buildColorResult(hex: string, format: ColorPayload["format"]): string {
  switch (format) {
    case "hex": return hex.slice(1).toUpperCase();
    case "rgb": return hexToRgb(hex);
    case "hsl": return hexToHsl(hex);
  }
}

function formatLabel(hex: string, format: ColorPayload["format"]): string {
  switch (format) {
    case "hex": return `#${hex.slice(1).toUpperCase()}`;
    case "rgb": return `rgb(${hexToRgb(hex).replace(/_/g, ", ")})`;
    case "hsl": return `hsl(${hexToHsl(hex).replace(/_/g, ", ")})`;
  }
}

export function ColorWidget({ payload }: Props) {
  const s = resolveStyle(payload.style);
  const [color, setColor] = useState(s.accent);

  function handleConfirm() {
    hapticNotification("success");
    submitAndClose(encodeResult(payload, buildColorResult(color, payload.format)));
  }

  return (
    <div
      class={pageClass(s.tint, s.liquidGlass)}
      style={pageStyle(s.tint, s.liquidGlass)}
    >
      <div class={`w-full max-w-sm ${cardClass(s.liquidGlass)}`}>
        <h2 class="text-xl font-semibold tracking-tight text-gray-900">Select Color</h2>

        <div class="flex flex-col items-center gap-5">
          {/* preview swatch */}
          <div
            class="w-28 h-28 rounded-3xl shadow-lg transition-all duration-200"
            style={{
              backgroundColor: color,
              boxShadow: `0 8px 32px ${color}66`,
            }}
          />

          {/* native color input, styled to look clean */}
          <div class="relative w-full">
            <input
              type="color"
              value={color}
              onInput={(e) => {
                hapticImpact("light");
                setColor((e.target as HTMLInputElement).value);
              }}
              class="w-full h-14 cursor-pointer rounded-2xl border-0 bg-transparent p-1"
              style={{ colorScheme: "light" }}
            />
          </div>

          <span class="text-sm font-mono text-gray-500">
            {formatLabel(color, payload.format)}
          </span>
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
