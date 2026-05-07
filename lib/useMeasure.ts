import { useCallback, useEffect, useState } from 'react';

export default function useMeasure<T extends Element>() {
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback((n: T | null) => setNode(n), []);

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!node) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];
      setSize({ width, height });
    });

    observer.observe(node);

    return () => observer.unobserve(node);
  }, [node]);

  return [ref, size] as const;
}
