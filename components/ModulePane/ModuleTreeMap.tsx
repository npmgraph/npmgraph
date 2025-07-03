import { type HierarchyRectangularNode, stratify, treemap } from 'd3-hierarchy';
import React, { type ReactElement, useEffect, useState } from 'react';
import { $ } from 'select-dom';
import type { BundlePhobiaData } from '../../lib/fetch_types.js';
import human from '../../lib/human.js';

import { percent } from '../../lib/dom.js';
import * as styles from './ModuleTreeMap.module.scss';

export function ModuleTreeMap({
  data,
  style,
  ...props
}: {
  data: BundlePhobiaData;
  style?: React.CSSProperties;
}) {
  const [leaves, setLeaves] = useState<ReactElement[]>([]);

  // Render contents as an "effect" because d3 requires the pixel dimensions of the div
  useEffect(() => {
    const { clientWidth: w, clientHeight: h } = $('#treemap')!;
    const m = 1;

    // Note: dependencySizes is *sometimes* undefined.  E.g.
    // https://bundlephobia.com/api/size?package=string_decoder%401.1.1
    const { size, dependencySizes = [] } = data;

    const sum = data.dependencySizes?.reduce(
      (sum, n) => sum + n.approximateSize,
      0,
    );

    const nodes = [...dependencySizes];

    // Placeholder root node so the other nodes have a common parent
    nodes.push({ name: '__root', approximateSize: 0 });

    const root = stratify<BundlePhobiaData['dependencySizes'][number]>()
      .id(d => d.name)
      .parentId(node => (node.name === '__root' ? '' : '__root'))(nodes)
      .sum(d => (d.approximateSize * size) / sum)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    treemap<BundlePhobiaData['dependencySizes'][number]>()
      .size([w, h])
      .padding(0)(root);

    const newLeaves = root.leaves().map((d, i, a) => {
      // Cast to rectangular node so we can get dimensions,
      const rd = d as unknown as HierarchyRectangularNode<
        BundlePhobiaData['dependencySizes'][number]
      >;
      const size = human(d.value ?? 0, 'B');
      const frac = ((rd.x1 - rd.x0) * (rd.y1 - rd.y0)) / (w * h);
      const backgroundColor = `
            color-mix(in srgb, color-mix(in oklch increasing hue, var(--bg-orange),
            var(--bg-red)
       ${percent(i ? i / (a.length - 1) : 0)}), var(--root-color) 25%)`;

      return (
        <div
          key={d.data.name}
          title={`${d.data.name} (${size})`}
          className={styles.root}
          style={{
            left: `${rd.x0 + m / 2}px`,
            top: `${rd.y0 + m / 2}px`,
            width: `${rd.x1 - rd.x0 - m}px`,
            height: `${rd.y1 - rd.y0 - m}px`,
            fontSize: `${65 + 70 * Math.sqrt(frac)}%`,
            backgroundColor,
          }}
        >
          {d.data.name} <span>{size}</span>
        </div>
      );
    });

    setLeaves(newLeaves);
  }, [data]);

  return (
    <div id="treemap" style={{ position: 'relative', ...style }} {...props}>
      {leaves}
    </div>
  );
}
