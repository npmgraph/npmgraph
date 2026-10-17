import { describe, expect, it } from 'vitest';
import type { BundlePhobiaData } from '../../lib/fetch-types.ts';
import { layoutTreemap } from './ModuleTreeMap.tsx';

const data = {
  size: 1000,
  dependencySizes: [
    { name: 'small', approximateSize: 100 },
    { name: 'large', approximateSize: 600 },
    { name: 'medium', approximateSize: 300 },
  ],
} as BundlePhobiaData;

describe('layoutTreemap', () => {
  it('has a leaf per dependency, largest first', () => {
    const leaves = layoutTreemap(data, 1200, 600);

    expect(leaves.map(leaf => leaf.name)).toEqual(['large', 'medium', 'small']);
    expect(leaves.map(leaf => Math.round(leaf.value))).toEqual([600, 300, 100]);
    expect(leaves.map(leaf => leaf.rank)).toEqual([0, 0.5, 1]);
  });

  it('groups unreadable dependencies and all smaller ones as others', () => {
    const leaves = layoutTreemap(
      {
        size: 1000,
        dependencySizes: [
          { name: 'large', approximateSize: 700 },
          { name: 'medium', approximateSize: 295 },
          { name: 'tiny', approximateSize: 4 },
          { name: 'smaller', approximateSize: 1 },
        ],
      } as BundlePhobiaData,
      800,
      400,
    );

    expect(leaves.map(leaf => leaf.name)).toEqual([
      'large',
      'medium',
      'others',
    ]);
    expect(leaves.map(leaf => Math.round(leaf.value))).toEqual([700, 295, 5]);
  });

  it('has no leaves without dependencies', () => {
    expect(layoutTreemap({ size: 1000 } as BundlePhobiaData, 300, 150)).toEqual(
      [],
    );
    expect(
      layoutTreemap(
        { size: 1000, dependencySizes: [] } as unknown as BundlePhobiaData,
        300,
        150,
      ),
    ).toEqual([]);
  });

  it('keeps the leaves inside the container', () => {
    for (const leaf of layoutTreemap(data, 1200, 600)) {
      expect(leaf.x0).toBeGreaterThanOrEqual(0);
      expect(leaf.y0).toBeGreaterThanOrEqual(0);
      expect(leaf.x1).toBeLessThanOrEqual(1200);
      expect(leaf.y1).toBeLessThanOrEqual(600);
    }
  });

  it('gives larger dependencies more of the container', () => {
    const [large, medium, small] = layoutTreemap(data, 1200, 600);
    expect(large!.coverage).toBeGreaterThan(medium!.coverage);
    expect(medium!.coverage).toBeGreaterThan(small!.coverage);
  });
});
