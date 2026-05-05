import { useState } from "preact/hooks";
import type { DateKind, DateMode, DateFormat, DateOrder, ColorFormat, ColorScheme, WidgetStyle } from "../lib/payload";

export type WidgetType = "date" | "color" | "schedule";

export interface BuilderState {
  widgetType: WidgetType;
  setWidgetType: (v: WidgetType) => void;

  botUsername: string;
  setBotUsername: (v: string) => void;

  dateKind: DateKind;
  setDateKind: (v: DateKind) => void;

  dateRange: boolean;
  setDateRange: (v: boolean) => void;

  dateMode: DateMode;

  dateFormat: DateFormat;
  setDateFormat: (v: DateFormat) => void;

  dateOrder: DateOrder;
  setDateOrder: (v: DateOrder) => void;

  colorFormat: ColorFormat;
  setColorFormat: (v: ColorFormat) => void;

  liquidGlass: boolean;
  setLiquidGlass: (v: boolean) => void;

  colorScheme: ColorScheme;
  setColorScheme: (v: ColorScheme) => void;

  adaptTgTheme: boolean;
  setAdaptTgTheme: (v: boolean) => void;

  accent: string;
  setAccent: (v: string) => void;

  tint: string;
  setTint: (v: string) => void;

  generatedUrl: string;
}

function resolveMode(kind: DateKind, range: boolean): DateMode {
  if (range) {
    if (kind === "date") return "date-range";
    if (kind === "time") return "time-range";
  }
  return kind;
}

export function useBuilderState(): BuilderState {
  const [widgetType, setWidgetType] = useState<WidgetType>("date");
  const [botUsername, setBotUsername] = useState("");
  const [dateKind, setDateKind] = useState<DateKind>("date");
  const [dateRange, setDateRange] = useState(false);
  const [dateFormat, setDateFormat] = useState<DateFormat>("default");
  const [dateOrder, setDateOrder] = useState<DateOrder>("ymd");
  const [colorFormat, setColorFormat] = useState<ColorFormat>("hex");
  const [liquidGlass, setLiquidGlass] = useState(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const [adaptTgTheme, setAdaptTgTheme] = useState(false);
  const [accent, setAccent] = useState("#007AFF");
  const [tint, setTint] = useState("#F2F2F7");

  const dateMode = resolveMode(dateKind, dateRange);
  const style: WidgetStyle = { liquidGlass, accent, tint, colorScheme, adaptTgTheme };

  const payload =
    widgetType === "date"
      ? { widget: "date" as const, mode: dateMode, format: dateFormat, order: dateOrder, bot_username: botUsername, style }
      : widgetType === "color"
      ? { widget: "color" as const, format: colorFormat, bot_username: botUsername, style }
      : { widget: "schedule" as const, format: "bunch" as const, bot_username: botUsername, style };

  const p = btoa(JSON.stringify(payload));
  const generatedUrl = `${window.location.origin}${window.location.pathname}?p=${p}`;

  return {
    widgetType, setWidgetType,
    botUsername, setBotUsername,
    dateKind, setDateKind,
    dateRange, setDateRange,
    dateMode,
    dateFormat, setDateFormat,
    dateOrder, setDateOrder,
    colorFormat, setColorFormat,
    liquidGlass, setLiquidGlass,
    colorScheme, setColorScheme,
    adaptTgTheme, setAdaptTgTheme,
    accent, setAccent,
    tint, setTint,
    generatedUrl,
  };
}
