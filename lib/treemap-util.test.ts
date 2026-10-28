import { describe, expect, it } from 'vitest';
import type { BundlePhobiaData } from './fetch-types.ts';
import { layoutTreemap } from './treemap-util.ts';

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

  it('keeps the five largest modules and aggregates the rest', () => {
    const leaves = layoutTreemap(
      {
        size: 28,
        dependencySizes: [
          { name: 'one', approximateSize: 7 },
          { name: 'two', approximateSize: 6 },
          { name: 'three', approximateSize: 5 },
          { name: 'four', approximateSize: 4 },
          { name: 'five', approximateSize: 3 },
          { name: 'six', approximateSize: 2 },
          { name: 'seven', approximateSize: 1 },
        ],
      } as BundlePhobiaData,
      20,
      20,
    );

    expect(leaves.map(leaf => leaf.name)).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
      'others',
    ]);
    expect(leaves.map(leaf => Math.round(leaf.value))).toEqual([
      7, 6, 5, 4, 3, 3,
    ]);
  });

  it('groups modules after the five largest into others', () => {
    const leaves = layoutTreemap(
      {
        size: 45,
        dependencySizes: Array.from({ length: 9 }, (_, index) => ({
          name: `module-${index + 1}`,
          approximateSize: 9 - index,
        })),
      } as BundlePhobiaData,
      1200,
      600,
    );

    expect(leaves.map(leaf => leaf.name)).toEqual([
      'others',
      'module-1',
      'module-2',
      'module-3',
      'module-4',
      'module-5',
    ]);
    expect(leaves.map(leaf => Math.round(leaf.value))).toEqual([
      10, 9, 8, 7, 6, 5,
    ]);
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
