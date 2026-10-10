import { useEffect, useState } from 'react';

export default function useMeasure<T extends Element>() {
  const [target, setTarget] = useState<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!target) {
      return;
    }

    const update = () => {
      setSize({ width: target.clientWidth, height: target.clientHeight });
    };

    // ResizeObserver reports the initial size right after observe()
    const observer = new ResizeObserver(update);
    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [target]);

  return [setTarget, size] as const;
}
