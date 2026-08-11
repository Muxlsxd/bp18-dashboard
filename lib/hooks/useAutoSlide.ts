import { useEffect, useState } from "react";

// Cycles through `count` sections every `intervalMs`, clearing the timer on unmount.
export function useAutoSlide(count: number, intervalMs = 15000) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs]);

  return { current, setCurrent };
}
