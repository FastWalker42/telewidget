import { useEffect, useRef, useState } from "preact/hooks";
import { hapticSelection } from "../lib/tma";

interface Props {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  width?: string;
}

const ITEM_HEIGHT = 44;
const VISIBLE = 5;
const PADDING = Math.floor(VISIBLE / 2);

export function ScrollPicker({ items, value, onChange, width = "80px" }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const selectedIndex = items.indexOf(value);
  const lastEmitted = useRef(selectedIndex);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ y: 0, scrollTop: 0 });

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = selectedIndex * ITEM_HEIGHT;
  }, [selectedIndex]);

  function emitNearest(snap: boolean) {
    const el = listRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    if (snap) el.scrollTop = clamped * ITEM_HEIGHT;
    if (clamped !== lastEmitted.current) {
      lastEmitted.current = clamped;
      hapticSelection();
      onChange(items[clamped]!);
    }
  }

  function onPointerDown(e: PointerEvent) {
    const el = listRef.current;
    if (!el) return;
    setIsDragging(true);
    dragStart.current = { y: e.clientY, scrollTop: el.scrollTop };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = dragStart.current.scrollTop + (dragStart.current.y - e.clientY);
    emitNearest(false);
  }

  function onPointerUp() {
    setIsDragging(false);
    emitNearest(true);
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
      <div
        class="pointer-events-none absolute inset-x-0 z-10 rounded-xl bg-black/5"
        style={{ top: `${PADDING * ITEM_HEIGHT}px`, height: `${ITEM_HEIGHT}px` }}
      />
      <div class="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-white/80 to-transparent" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-white/80 to-transparent" />

      <ul
        ref={listRef}
        class="absolute inset-0 overflow-y-scroll"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onScroll={() => emitNearest(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {padded.map((item, i) => (
          <li
            key={i}
            style={{ height: `${ITEM_HEIGHT}px`, scrollSnapAlign: "start" }}
            class={[
              "flex items-center justify-center text-xl font-medium transition-all duration-150",
              item === value ? "text-gray-900 scale-110" : "text-gray-400",
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
