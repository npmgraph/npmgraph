import { type HierarchyRectangularNode, stratify, treemap } from 'd3-hierarchy';
import { useEffect, useRef, useState } from 'react';
import type { BundlePhobiaData } from '../../lib/fetch-types.ts';
import human from '../../lib/human.ts';

import { percent } from '../../lib/dom.ts';
import * as styles from './ModuleTreeMap.module.scss';

type Dependency = BundlePhobiaData['dependencySizes'][number];

type TreemapLeaf = {
  key: string;
  name: string;
  value: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  // Fraction of the container that this leaf covers
  coverage: number;
  // Position among the leaves, from 0 (largest) to 1 (smallest)
  rank: number;
};

// Lay out the dependencies as a treemap, sized by their share of the module size
export function layoutTreemap(
  data: BundlePhobiaData,
  w: number,
  h: number,
): TreemapLeaf[] {
  // Note: dependencySizes is *sometimes* undefined.  E.g.
  // https://bundlephobia.com/api/size?package=string_decoder%401.1.1
  // eslint-disable-next-line @typescript-eslint/no-useless-default-assignment -- See note in BundlePhobiaData
  const { size, dependencySizes = [] } = data;

  // Without dependencies the placeholder root would be the only (and a full-size) leaf
  if (dependencySizes.length === 0) {
    return [];
  }

  const layout = (dependencies: Dependency[]) => {
    const dependencySum = dependencies.reduce(
      (sum, n) => sum + n.approximateSize,
      0,
    );
    const nodes = [
      ...dependencies,

      // Placeholder root node so the other nodes have a common parent
      { name: '__root', approximateSize: 0 },
    ];

    const root = stratify<Dependency>()
      .id(d => d.name)
      .parentId(node => (node.name === '__root' ? '' : '__root'))(nodes)
      .sum(d => (d.approximateSize * size) / dependencySum)

      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    treemap<Dependency>().size([w, h]).padding(2)(root);

    return root.leaves().map((d, i, a) => {
      // Cast to rectangular node so we can get dimensions,
      const rd = d as unknown as HierarchyRectangularNode<Dependency>;
      return {
        key: d.data.name,
        name: d.data.name,
        value: d.value ?? 0,
        x0: rd.x0,
        y0: rd.y0,
        x1: rd.x1,
        y1: rd.y1,
        coverage: ((rd.x1 - rd.x0) * (rd.y1 - rd.y0)) / (w * h),
        rank: i ? i / (a.length - 1) : 0,
      };
    });
  };

  const leaves = layout(dependencySizes);
  const firstToAggregate = Math.min(leaves.length, 5);

  if (firstToAggregate === leaves.length) {
    return leaves;
  }

  const retainedNames = new Set(
    leaves.slice(0, firstToAggregate).map(leaf => leaf.name),
  );
  const retained = dependencySizes.filter(d => retainedNames.has(d.name));
  const hidden = dependencySizes.filter(d => !retainedNames.has(d.name));
  const names = new Set(dependencySizes.map(d => d.name));
  let othersKey = '__others';

  while (names.has(othersKey)) {
    othersKey += '_';
  }

  return layout([
    ...retained,
    {
      name: othersKey,
      approximateSize: hidden.reduce(
        (total, d) => total + d.approximateSize,
        0,
      ),
    },
  ]).map(leaf => (leaf.key === othersKey ? { ...leaf, name: 'others' } : leaf));
}

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
