import { describe, expect, it } from 'vitest';
import type { BundlePhobiaData } from './fetch-types.ts';
import { hasTreemap, layoutTreemap } from './treemap-util.ts';

const data = {
  size: 1000,
  dependencySizes: [
    { name: 'small', approximateSize: 100 },
    { name: 'large', approximateSize: 600 },
    { name: 'medium', approximateSize: 300 },
  ],
} as BundlePhobiaData;

describe('layoutTreemap', () => {
  it('does not list the module itself as a dependency', () => {
    const leaves = layoutTreemap(
      {
        name: 'wrapper',
        size: 1000,
        dependencySizes: [
          { name: 'wrapper', approximateSize: 10 },
          { name: 'dependency', approximateSize: 990 },
        ],
      } as BundlePhobiaData,
      300,
      150,
    );

    expect(leaves.map(leaf => leaf.name)).toEqual(['dependency']);
  });

  it('has a leaf per dependency, largest first', () => {
    const leaves = layoutTreemap(data, 1200, 600);

    expect(leaves.map(leaf => leaf.name)).toEqual(['large', 'medium', 'small']);
    expect(leaves.map(leaf => Math.round(leaf.value))).toEqual([600, 300, 100]);
    expect(leaves.map(leaf => leaf.rank)).toEqual([0, 0.5, 1]);
  });

  it('drops the tiny modules into a small others tile in the bottom-right corner', () => {
    const leaves = layoutTreemap(
      {
        size: 5010,
        dependencySizes: [
          ...Array.from({ length: 5 }, (_, index) => ({
            name: `large-${index + 1}`,
            approximateSize: 1000,
          })),
          ...Array.from({ length: 10 }, (_, index) => ({
            name: `tiny-${index + 1}`,
            approximateSize: 1,
          })),
        ],
      } as BundlePhobiaData,
      300,
      150,
    );
    const others = leaves.at(-1)!;

    expect(leaves.map(leaf => leaf.name)).toEqual([
      'large-1',
      'large-2',
      'large-3',
      'large-4',
      'large-5',
      'others',
    ]);
    expect(others.hiddenCount).toBe(10);
    expect(Math.round(others.value)).toBe(10);
    expect(others.x1).toBe(300);
    expect(others.y1).toBe(150);
    expect(others.x1 - others.x0).toBeLessThanOrEqual(90);
    expect(others.y1 - others.y0).toBeLessThanOrEqual(22);

    // It doesn't cover any module
    for (const leaf of leaves.slice(0, -1)) {
      expect(leaf.y1).toBeLessThanOrEqual(others.y0);
    }
  });

  it('keeps the five largest modules even if they are tiny', () => {
    const leaves = layoutTreemap(
      {
        size: 7,
        dependencySizes: Array.from({ length: 7 }, (_, index) => ({
          name: `module-${index + 1}`,
          approximateSize: 1,
        })),
      } as BundlePhobiaData,
      20,
      20,
    );

    expect(leaves).toHaveLength(6);
    expect(
      leaves.slice(0, 5).every(leaf => leaf.name.startsWith('module-')),
    ).toBe(true);
    expect(leaves.at(-1)!.hiddenCount).toBe(2);
  });

  it('has no others tile when every module is big enough', () => {
    expect(layoutTreemap(data, 1200, 600).some(leaf => leaf.hiddenCount)).toBe(
      false,
    );
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

describe('hasTreemap', () => {
  const glob = { name: 'glob', size: 1000, dependencyCount: 5 };

  it('is true when there are dependencies to show', () => {
    expect(
      hasTreemap({
        ...glob,
        dependencySizes: [
          { name: 'glob', approximateSize: 10 },
          { name: 'minimatch', approximateSize: 990 },
        ],
      } as BundlePhobiaData),
    ).toBe(true);
  });

  it('is false when only the module itself is listed', () => {
    expect(
      hasTreemap({
        ...glob,
        dependencySizes: [{ name: 'glob', approximateSize: 1000 }],
      } as BundlePhobiaData),
    ).toBe(false);
  });

  it('is false when dependencySizes is empty or missing', () => {
    expect(
      hasTreemap({
        ...glob,
        dependencySizes: [],
      } as unknown as BundlePhobiaData),
    ).toBe(false);
    expect(hasTreemap(glob as unknown as BundlePhobiaData)).toBe(false);
  });
});
