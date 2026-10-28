import { useEffect, useRef, useState } from 'react';
import type { BundlePhobiaData } from '../../lib/fetch-types.ts';
import human from '../../lib/human.ts';

import { percent } from '../../lib/dom.ts';
import * as styles from './ModuleTreeMap.module.scss';
import { type TreemapLeaf, layoutTreemap } from '../../lib/treemap-util.js';

export function ModuleTreeMap({
  data,
  style,
  ...props
}: {
  data: BundlePhobiaData;
  style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leaves, setLeaves] = useState<TreemapLeaf[]>([]);
  const m = 1;

  // Lay out as an "effect" because d3 requires the pixel dimensions of the div
  useEffect(() => {
    let isCancelled = false;

    const { clientWidth, clientHeight } = containerRef.current!;
    const newLeaves = layoutTreemap(data, clientWidth, clientHeight);

    queueMicrotask(() => {
      if (isCancelled) {
        return;
      }

      setLeaves(newLeaves);
    });

    return () => {
      isCancelled = true;
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', ...style }}
      {...props}
    >
      {leaves.map(leaf => {
        const size = human(leaf.value, 'B');
        const backgroundColor = `
            color-mix(in srgb, color-mix(in oklch increasing hue, var(--bg-orange),
            var(--bg-red)
       ${percent(leaf.rank)}), var(--root-color) 25%)`;

        return (
          <div
            key={leaf.key}
            title={`${leaf.name} (${size})`}
            className={styles.root}
            style={{
              left: `${leaf.x0 + m / 2}px`,
              top: `${leaf.y0 + m / 2}px`,
              width: `${leaf.x1 - leaf.x0 - m}px`,
              height: `${leaf.y1 - leaf.y0 - m}px`,
              fontSize: `${65 + 70 * Math.sqrt(leaf.coverage)}%`,
              backgroundColor,
            }}
          >
            {leaf.name} <span>{size}</span>
          </div>
        );
      })}
    </div>
  );
}
