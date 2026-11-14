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
  // Set on the tile that stands for the dropped modules (not a module itself): how many
  hiddenCount?: number;
};

// Note: dependencySizes is *sometimes* undefined.  E.g.
// https://bundlephobia.com/api/size?package=string_decoder%401.1.1
// The module itself is listed among its dependencies, so it's left out
function getDependencySizes({
  dependencySizes,
  name,
}: BundlePhobiaData): BundlePhobiaData['dependencySizes'] {
  return (dependencySizes ?? []).filter(d => d.name !== name);
}

export function hasTreemap(data: BundlePhobiaData): boolean {
  return getDependencySizes(data).length > 0;
}

// Tiles thinner than this (in px) are noise, but the largest few are always kept
const MIN_TILE_SIZE = 20;
const MIN_TILE_COUNT = 5;
const OTHERS_KEY = '__others';

// Lay out the dependencies as a treemap, sized by their share of the module size
export function layoutTreemap(
  data: BundlePhobiaData,
  w: number,
  h: number,
): TreemapLeaf[] {
  type Dependency = BundlePhobiaData['dependencySizes'][number];

  const { size } = data;
  const dependencySizes = getDependencySizes(data);

  // Without dependencies the placeholder root would be the only (and a full-size) leaf
  if (dependencySizes.length === 0) {
    return [];
  }

  const dependencySum = dependencySizes.reduce(
    (sum, n) => sum + n.approximateSize,
    0,
  );

  const layout = (dependencies: Dependency[]) => {
    const nodes = [
      ...dependencies,

      // Placeholder root node so the other nodes have a common parent
      { name: '__root', approximateSize: 0 },
    ];

    const root = stratify<Dependency>()
      .id(d => d.name)
      .parentId(node => (node.name === '__root' ? '' : '__root'))(nodes)
      .sum(d => (d.approximateSize * size) / dependencySum)

      // The others tile goes last, so it ends up in the bottom-right corner
      .sort(
        (a, b) =>
          Number(a.data.name === OTHERS_KEY) -
            Number(b.data.name === OTHERS_KEY) ||
          (b.value ?? 0) - (a.value ?? 0),
      );

    treemap<Dependency>().size([w, h]).padding(2)(root);

    return root.leaves().map((d, i, a): TreemapLeaf => {
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
  const noise = new Set(
    leaves
      .filter(
        (leaf, index) =>
          index >= MIN_TILE_COUNT &&
          Math.min(leaf.x1 - leaf.x0, leaf.y1 - leaf.y0) < MIN_TILE_SIZE,
      )
      .map(leaf => leaf.name),
  );

  if (noise.size === 0) {
    return leaves;
  }

  const kept = dependencySizes.filter(d => !noise.has(d.name));
  const hidden = dependencySizes.filter(d => noise.has(d.name));
  const hiddenSize = hidden.reduce((sum, d) => sum + d.approximateSize, 0);

  return layout([
    ...kept,
    { name: OTHERS_KEY, approximateSize: hiddenSize },
  ]).map(leaf =>
    leaf.key === OTHERS_KEY
      ? {
          ...leaf,
          name: 'others',
          value: (hiddenSize * size) / dependencySum,
          hiddenCount: hidden.length,
        }
      : leaf,
  );
}
