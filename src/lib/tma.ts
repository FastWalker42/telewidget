type HapticImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type HapticNotificationType = "error" | "success" | "warning";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openTelegramLink(url: string): void;
        close(): void;
        ready(): void;
        initData: string;
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
