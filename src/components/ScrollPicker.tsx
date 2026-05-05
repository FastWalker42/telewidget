import { useEffect, useRef } from "preact/hooks";
import { hapticSelection } from "../lib/tma";
import type { Theme } from "../lib/style";

interface Props {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  width?: string;
  theme?: Theme;
}

const ITEM_HEIGHT = 44;
const VISIBLE = 5;
const PADDING = Math.floor(VISIBLE / 2);

export function ScrollPicker({ items, value, onChange, width = "80px", theme }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const selectedIndex = items.indexOf(value);
  const lastEmitted = useRef(selectedIndex);
  const dragRef = useRef<{ y: number; scrollTop: number } | null>(null);
  const animRef = useRef<number>(0);

  // Sync scroll position when value changes externally
  useEffect(() => {
    const el = listRef.current;
    if (!el || dragRef.current) return;
    const target = selectedIndex * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - target) > 1) {
      el.scrollTop = target;
    }
  }, [selectedIndex]);

  function snapTo(idx: number) {
    const el = listRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
    if (clamped !== lastEmitted.current) {
      lastEmitted.current = clamped;
      hapticSelection();
      onChange(items[clamped]!);
    }
  }

  function nearestIndex() {
    const el = listRef.current;
    if (!el) return 0;
    return Math.round(el.scrollTop / ITEM_HEIGHT);
  }

  function onPointerDown(e: PointerEvent) {
    const el = listRef.current;
    if (!el) return;
    cancelAnimationFrame(animRef.current);
    dragRef.current = { y: e.clientY, scrollTop: el.scrollTop };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragRef.current) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = dragRef.current.scrollTop + (dragRef.current.y - e.clientY);

    const idx = nearestIndex();
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    if (clamped !== lastEmitted.current) {
      lastEmitted.current = clamped;
      hapticSelection();
      onChange(items[clamped]!);
    }
    e.preventDefault();
  }

  function onPointerUp(e: PointerEvent) {
    if (!dragRef.current) return;
    dragRef.current = null;
    snapTo(nearestIndex());
    e.preventDefault();
  }

  const padded = [
    ...Array(PADDING).fill(""),
    ...items,
    ...Array(PADDING).fill(""),
  ];

  return (
    <div
      style={{ width, height: `${ITEM_HEIGHT * VISIBLE}px` }}
      class="relative select-none overflow-hidden"
    >
      {/* selection highlight */}
      <div
        class="pointer-events-none absolute inset-x-0 z-10 rounded-xl"
        style={{
          top: `${PADDING * ITEM_HEIGHT}px`,
          height: `${ITEM_HEIGHT}px`,
          backgroundColor: theme?.surface ?? "rgba(0,0,0,0.06)",
        }}
      />
      {/* top fade */}
      <div
        class="pointer-events-none absolute inset-x-0 top-0 z-10 h-16"
        style={{ background: `linear-gradient(to bottom, ${theme?.fade ?? "#F2F2F7"}, transparent)` }}
      />
      {/* bottom fade */}
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
        style={{ background: `linear-gradient(to top, ${theme?.fade ?? "#F2F2F7"}, transparent)` }}
      />

      <ul
        ref={listRef}
        class="absolute inset-0 overflow-y-scroll"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          touchAction: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {padded.map((item, i) => (
          <li
            key={i}
            style={{
              height: `${ITEM_HEIGHT}px`,
              color: item === value
                ? (theme?.text ?? "#111111")
                : (theme?.textMuted ?? "#8E8E93"),
            }}
            class={[
              "flex items-center justify-center text-xl font-medium transition-colors duration-150",
              !item ? "pointer-events-none" : "",
            ].join(" ")}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
