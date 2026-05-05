import { useState } from "preact/hooks";
import type { ColorPayload } from "../../lib/payload";
import { encodeResult } from "../../lib/payload";
import { submitAndClose, hapticImpact, hapticNotification } from "../../lib/tma";
import { useResolvedStyle, cardClass, pageProps, buttonStyle } from "../../lib/style";

interface Props {
  payload: ColorPayload;
}

function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function hexToHsl(hex: string): [number, number, number] {
  const [ri, gi, bi] = parseHex(hex);
  const r = ri / 255, g = gi / 255, b = bi / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

type ColorFormat = ColorPayload["format"];

function buildColorResult(hex: string, format: ColorFormat): string {
  if (format === "hex") return hex.slice(1).toUpperCase();
  if (format === "rgb") return parseHex(hex).join("_");
  const [h, s, l] = hexToHsl(hex);
  return `${h}_${s}_${l}`;
}

function formatLabel(hex: string, format: ColorFormat): string {
  if (format === "hex") return `#${hex.slice(1).toUpperCase()}`;
  if (format === "rgb") return `rgb(${parseHex(hex).join(", ")})`;
  const [h, s, l] = hexToHsl(hex);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function ColorWidget({ payload }: Props) {
  const s = useResolvedStyle(payload.style);
  const [color, setColor] = useState(s.accent);

  function handleConfirm() {
    hapticNotification("success");
    submitAndClose(encodeResult(payload, buildColorResult(color, payload.format)));
  }

  return (
    <div {...pageProps(s.tint, s.liquidGlass, s.dark)}>
      <div class={`w-full max-w-sm ${cardClass(s.liquidGlass, s.dark)}`}>
        <h2 class="text-xl font-semibold tracking-tight" style={{ color: s.theme.text }}>Select Color</h2>

        <div class="flex flex-col items-center gap-5">
          <div
            class="w-28 h-28 rounded-3xl transition-all duration-200"
            style={{
              backgroundColor: color,
              boxShadow: `0 8px 32px ${color}66`,
            }}
          />

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

          <span class="text-sm font-mono" style={{ color: s.theme.textSub }}>
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
