import { useLayoutEffect, useRef, useState } from "react";

export function useClampDetector() {
  const mapRef = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [isClamped, setIsClamped] = useState<Record<string, boolean>>({});

  const setRefFor = (id: string) => (el: HTMLParagraphElement | null) => {
    mapRef.current[id] = el;
    if (!el) return;

    const measure = () => {
      const clamped = el.scrollHeight > el.clientHeight;
      setIsClamped(prev => (prev[id] === clamped ? prev : { ...prev, [id]: clamped }));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => ro.disconnect();
  };

  return { setRefFor, isClamped };
}