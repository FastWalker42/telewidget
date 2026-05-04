export type DateMode = "date" | "time" | "datetime" | "date-range";
export type ColorFormat = "hex" | "rgb" | "hsl";

export interface WidgetStyle {
  liquidGlass?: boolean;
  accent?: string;
  tint?: string;
}

interface BasePayload {
  user_id: string;
  bot_username: string;
  user_avatar?: string;
  style?: WidgetStyle;
}

export interface DatePayload extends BasePayload {
  widget: "date";
  mode: DateMode;
}

export interface ColorPayload extends BasePayload {
  widget: "color";
  format: ColorFormat;
}

export type WidgetPayload = DatePayload | ColorPayload;

export function parsePayload(): WidgetPayload | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("p");
    if (!raw) return null;
    const json = atob(raw);
    return JSON.parse(json) as WidgetPayload;
  } catch {
    return null;
  }
}

export function encodeResult(payload: WidgetPayload, value: string): string {
  return `https://t.me/${payload.bot_username}?start=${value}`;
}
