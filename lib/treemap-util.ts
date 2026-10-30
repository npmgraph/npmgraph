import { type HierarchyRectangularNode, stratify, treemap } from 'd3-hierarchy';
import type { BundlePhobiaData } from './fetch-types.ts';

export type TreemapLeaf = {
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
  type Dependency = BundlePhobiaData['dependencySizes'][number];

  // Note: dependencySizes is *sometimes* undefined.  E.g.
  // https://bundlephobia.com/api/size?package=string_decoder%401.1.1
  const { size, name } = data;

  // The module itself is listed among its dependencies
  const dependencySizes = (data.dependencySizes ?? []).filter(
    d => d.name !== name,
  );

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
