import { useEffect, useRef, useState } from 'react';
import useGraphSelection from '../../hooks/useGraphSelection.ts';
import { cn, percent } from '../../lib/dom.ts';
import type { BundlePhobiaData } from '../../lib/fetch-types.ts';
import human from '../../lib/human.ts';
import { QueryType } from '../../lib/ModuleCache.ts';
import { type TreemapLeaf, layoutTreemap } from '../../lib/treemap-util.js';
import * as utilities from '../ui/utilities.module.css';
import * as styles from './ModuleTreeMap.module.css';

// When it doesn't fit at all, the name is only in the tooltip
const isLabelVisible = (width: number, height: number, fontScale: number) =>
  width >= fontScale * 32 && height >= fontScale * 24;

// The size is secondary, so it only shows when it has a line of its own
const isSizeVisible = (width: number, height: number, fontScale: number) =>
  width >= 56 && height >= fontScale * 21 + 19;

export function ModuleTreeMap({
  data,
  style,
  ...props
}: {
  data: BundlePhobiaData;
  style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setGraphSelection = useGraphSelection()[2];
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

        const width = leaf.x1 - leaf.x0 - m;
        const height = leaf.y1 - leaf.y0 - m;
        const fontScale = 0.65 + 0.7 * Math.sqrt(leaf.coverage);
        const position = {
          left: `${leaf.x0 + m / 2}px`,
          top: `${leaf.y0 + m / 2}px`,
          width: `${width}px`,
          height: `${height}px`,
          fontSize: `${fontScale * 100}%`,
        };

        // It isn't a module, so there's nothing to select
        if (leaf.hiddenCount !== undefined) {
          const label = `+${leaf.hiddenCount} more`;
          return (
            <div
              key={leaf.key}
              title={`${label} (${size})`}
              className={cn(styles.root, styles.others)}
              style={position}
            >
              {isLabelVisible(width, height, fontScale) && label}
            </div>
          );
        }

        return (
          <button
            key={leaf.key}
            type="button"
            title={`${leaf.name} (${size})`}
            className={cn(styles.root, utilities.brightHover)}
            style={{ ...position, backgroundColor }}
            onClick={() => {
              setGraphSelection(QueryType.Default, leaf.name);
            }}
          >
            {isLabelVisible(width, height, fontScale) && (
              <>
                {leaf.name}{' '}
                {isSizeVisible(width, height, fontScale) && <span>{size}</span>}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
