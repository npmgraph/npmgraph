import { useEffect, useRef, useState, type CSSProperties } from 'react';
import useGraphSelection from '../../hooks/useGraphSelection.ts';
import { cn, percent } from '../../lib/dom.ts';
import type { BundlePhobiaData } from '../../lib/fetch-types.ts';
import human from '../../lib/human.ts';
import { QueryType } from '../../lib/ModuleCache.ts';
import { layoutTreemap, type TreemapLeaf } from '../../lib/treemap-util.js';
import * as utilities from '../ui/utilities.module.css';
import * as styles from './ModuleTreeMap.module.css';

// When it doesn't fit at all, the name is only in the tooltip
const isLabelVisible = (width: number, height: number, fontScale: number) =>
  width >= fontScale * 32 && height >= fontScale * 24;

// The size is secondary, so it only shows when it has a line of its own
const isSizeVisible = (width: number, height: number, fontScale: number) =>
  width >= 56 && height >= fontScale * 21 + 19;

export function ModuleTreeMap({ data }: { data: BundlePhobiaData }) {
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
    <div ref={containerRef} className={styles.container}>
      {leaves.map(leaf => {
        const size = human(leaf.value, 'B');
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
            className={cn(styles.root, styles.leaf, utilities.brightHover)}
            style={
              { ...position, '--rank': percent(leaf.rank) } as CSSProperties
            }
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
