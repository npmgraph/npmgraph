import {
  HierarchyRectangularNode,
  hierarchy,
  stratify,
  treemap,
} from 'd3-hierarchy';
import React, { useEffect, useState } from 'react';
import { $, human } from '../util.js';
import { BundlePhobiaData } from '../fetch_types.js';

export function ModuleTreeMap({
  data,
  style,
  ...props
}: {
  data: BundlePhobiaData;
  style?: React.CSSProperties;
}) {
  const [leaves, setLeaves] = useState<JSX.Element[]>([]);

  // Render contents as an "effect" because d3 requires the pixel dimensions of the div
  useEffect(() => {
    const { clientWidth: w, clientHeight: h } = $('#treemap')[0],
      m = 1;

    const { size } = data;

    const sum = data.dependencySizes?.reduce(
      (sum, n) => sum + n.approximateSize,
      0,
    );
    const MIN_SIZE = sum * 0.01;
    const nodes = [...data.dependencySizes];

    // Placeholder root node so the other nodes have a common parent
    nodes.push({ name: '__root', approximateSize: 0 });

    const root = stratify<BundlePhobiaData['dependencySizes'][number]>()
      .id(d => d.name)
      .parentId(node => (node.name == '__root' ? '' : '__root'))(nodes)
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
      return (
        <div
          key={i}
          title={`${d.data.name} (${size})`}
          className="bundle-item"
          style={{
            left: `${rd.x0 + m / 2}px`,
            top: `${rd.y0 + m / 2}px`,
            width: `${rd.x1 - rd.x0 - m}px`,
            height: `${rd.y1 - rd.y0 - m}px`,
            fontSize: `${65 + 70 * Math.sqrt(frac)}%`,
            backgroundColor: `hsl(${
              (75 + (i / a.length) * 360) % 360
            }, 50%, 70%)`,
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
