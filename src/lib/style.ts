import type { WidgetStyle } from "./payload";
import { useEffect, useState } from "preact/hooks";
import { getTgThemeParams, onTgThemeChange } from "./tma";

export interface Theme {
  /** Primary text */
  text: string;
  /** Secondary / label text */
  textSub: string;
  /** Muted / placeholder text */
  textMuted: string;
  /** Subtle surface (bg-black/5 equivalent) */
  surface: string;
  /** Fade gradient color for ScrollPicker (matches page bg) */
  fade: string;
  /** Separator / divider */
  separator: string;
}

export interface ResolvedStyle {
  accent: string;
  tint: string;
  liquidGlass: boolean;
  dark: boolean;
  theme: Theme;
}

const LIGHT = { accent: "#007AFF", tint: "#F2F2F7" };
const DARK  = { accent: "#0A84FF", tint: "#1C1C1E" };

const LIGHT_THEME: Theme = {
  text:      "#111111",
  textSub:   "#3C3C43",
  textMuted: "#8E8E93",
  surface:   "rgba(0,0,0,0.06)",
  fade:      "#F2F2F7",
  separator: "rgba(0,0,0,0.08)",
};

const DARK_THEME: Theme = {
  text:      "#FFFFFF",
  textSub:   "rgba(235,235,245,0.8)",
  textMuted: "rgba(235,235,245,0.45)",
  surface:   "rgba(255,255,255,0.13)",
  fade:      "#1C1C1E",
  separator: "rgba(255,255,255,0.18)",
};

function isDarkOS(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveBase(style?: WidgetStyle): ResolvedStyle {
  const scheme = style?.colorScheme ?? "light";
  const dark = scheme === "dark" || (scheme === "auto" && isDarkOS());
  const liquidGlass = style?.liquidGlass ?? false;
  const preset = dark ? DARK : LIGHT;
  const baseTheme = dark ? DARK_THEME : LIGHT_THEME;

  let accent = style?.accent ?? preset.accent;
  // tint is only meaningful for liquid glass; for solid bg we use the preset
  let tint = liquidGlass
    ? (style?.tint ?? preset.tint)
    : preset.tint;

  if (style?.adaptTgTheme) {
    const p = getTgThemeParams();
    if (p) {
      accent = p.button_color ?? p.accent_text_color ?? p.link_color ?? accent;
      if (liquidGlass) tint = p.bg_color ?? tint;
    }
  }

  // For liquid glass the card sits on a blurred gradient — fade must be transparent
  // so the picker fades into whatever is behind it, not into a solid color.
  // For solid backgrounds the fade color must exactly match the page bg (tint).
  const fade = liquidGlass ? "transparent" : tint;

  const theme: Theme = { ...baseTheme, fade };
  return { accent, tint, liquidGlass, dark, theme };
}

export function useResolvedStyle(style?: WidgetStyle): ResolvedStyle {
  const [resolved, setResolved] = useState(() => resolveBase(style));

  const isAuto      = style?.colorScheme === "auto";
  const adaptTg     = style?.adaptTgTheme ?? false;

  useEffect(() => {
    const update = () => setResolved(resolveBase(style));

    if (adaptTg) onTgThemeChange(update);

    if (isAuto) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
  }, [isAuto, adaptTg]);

  return resolved;
}

export function cardClass(liquidGlass: boolean, dark: boolean): string {
  if (liquidGlass) {
    if (dark) {
      return [
        "rounded-3xl p-6 flex flex-col gap-5",
        "bg-white/10 backdrop-blur-2xl",
        "border border-white/20",
        "shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]",
      ].join(" ");
    }
    return [
      "rounded-3xl p-6 flex flex-col gap-5",
      "bg-white/25 backdrop-blur-2xl",
      "border border-white/50",
      "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.7)]",
    ].join(" ");
  }
  if (dark) {
    return "rounded-3xl p-6 flex flex-col gap-5 bg-white/8 backdrop-blur-sm shadow-xl border border-white/10";
  }
  return "rounded-3xl p-6 flex flex-col gap-5 bg-white/90 backdrop-blur-sm shadow-xl border border-white/60";
}

export interface PageProps {
  class: string;
  style?: Record<string, string>;
}

export function pageProps(tint: string, liquidGlass: boolean, dark: boolean): PageProps {
  if (liquidGlass) {
    if (dark) {
      // Deep dark with subtle colored depth — feels like iOS dark blur
      return {
        class: "flex min-h-screen flex-col items-center justify-center p-5",
        style: {
          background: `radial-gradient(ellipse at 30% 20%, ${tint}55 0%, transparent 60%),
                       radial-gradient(ellipse at 70% 80%, ${tint}33 0%, transparent 60%),
                       #0a0a0f`,
        },
      };
    }
    return {
      class: "flex min-h-screen flex-col items-center justify-center p-5",
      style: { background: `linear-gradient(135deg, ${tint}cc 0%, ${tint}66 50%, ${tint}99 100%)` },
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
