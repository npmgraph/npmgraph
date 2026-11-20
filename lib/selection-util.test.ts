import { describe, expect, it } from 'vitest';
import { getSelectionTarget } from './selection-util.ts';

describe('getSelectionTarget', () => {
  it.each([
    // Graph shown: highlighting is feedback enough, unless the pick is an inspection
    { count: 0, isGraphShown: true, inspect: false, target: undefined },
    { count: 1, isGraphShown: true, inspect: false, target: undefined },
    { count: 1, isGraphShown: true, inspect: true, target: 'module' },
    { count: 3, isGraphShown: true, inspect: false, target: undefined },
    // Graph hidden (mobile, report-only): the pick would have no visible effect
    { count: 0, isGraphShown: false, inspect: false, target: undefined },
    { count: 1, isGraphShown: false, inspect: false, target: 'module' },
    { count: 3, isGraphShown: false, inspect: false, target: 'graph' },
  ] as const)(
    'is $target for $count modules (graph shown: $isGraphShown, inspect: $inspect)',
    ({ target, ...options }) => {
      expect(getSelectionTarget(options)).toBe(target);
    },
  );
});
