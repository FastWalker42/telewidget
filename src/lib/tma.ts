type HapticImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type HapticNotificationType = "error" | "success" | "warning";

export interface TgThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  bottom_bar_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openTelegramLink(url: string): void;
        close(): void;
        ready(): void;
        initData: string;
        colorScheme: "light" | "dark";
        themeParams: TgThemeParams;
        onEvent(event: string, callback: () => void): void;
        HapticFeedback?: {
          impactOccurred(style: HapticImpactStyle): void;
          notificationOccurred(type: HapticNotificationType): void;
          selectionChanged(): void;
        };
      };
    };
  }
}

export const isTMA = (): boolean =>
  typeof window !== "undefined" && !!window.Telegram?.WebApp?.initData;

export function submitAndClose(tgUrl: string): void {
  if (isTMA()) {
    window.Telegram!.WebApp!.openTelegramLink(tgUrl);
    window.Telegram!.WebApp!.close();
  } else {
    window.location.href = tgUrl;
  }
}

export function tmaReady(): void {
  if (isTMA()) window.Telegram!.WebApp!.ready();
}

export function hapticImpact(style: HapticImpactStyle = "light"): void {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
}

export function hapticSelection(): void {
  window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
}

export function hapticNotification(type: HapticNotificationType): void {
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
}

export function getTgThemeParams(): TgThemeParams | null {
  return window.Telegram?.WebApp?.themeParams ?? null;
}

export function getTgColorScheme(): "light" | "dark" | null {
  return window.Telegram?.WebApp?.colorScheme ?? null;
}

export function onTgThemeChange(cb: () => void): void {
  window.Telegram?.WebApp?.onEvent("themeChanged", cb);
}
