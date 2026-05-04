import type { WidgetStyle } from "./payload";

export interface ResolvedStyle {
  accent: string;
  tint: string;
  liquidGlass: boolean;
}

const DEFAULT_ACCENT = "#007AFF";
const DEFAULT_TINT = "#F2F2F7";

export function resolveStyle(style?: WidgetStyle): ResolvedStyle {
  return {
    accent: style?.accent ?? DEFAULT_ACCENT,
    tint: style?.tint ?? DEFAULT_TINT,
    liquidGlass: style?.liquidGlass ?? false,
  };
}

export function cardClass(liquidGlass: boolean): string {
  if (liquidGlass) {
    return [
      "rounded-3xl p-6 flex flex-col gap-5",
      "bg-white/20 backdrop-blur-2xl",
      "border border-white/40",
      "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)]",
    ].join(" ");
  }
  return "rounded-3xl p-6 flex flex-col gap-5 bg-white/90 backdrop-blur-sm shadow-xl border border-white/60";
}

export interface PageProps {
  class: string;
  style?: Record<string, string>;
}

export function pageProps(tint: string, liquidGlass: boolean): PageProps {
  if (liquidGlass) {
    return {
      class: "flex min-h-screen flex-col items-center justify-center p-5 bg-gradient-to-br from-sky-400/30 via-purple-400/20 to-pink-300/30",
    };
  }
  return {
    class: "flex min-h-screen flex-col items-center justify-center p-5",
    style: { backgroundColor: tint },
  };
}

export function buttonStyle(accent: string): Record<string, string> {
  return { backgroundColor: accent };
}
