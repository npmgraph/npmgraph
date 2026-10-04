import { describe, expect, it } from 'vitest';
import {
  getChildOverrides,
  getVersionOverride,
  isOverrides,
  type Overrides,
} from './overrides-util.ts';

describe('getVersionOverride', () => {
  it('should return the overridden version when a string override exists', () => {
    const overrides: Overrides = { 'package-b': '1.0.0' };
    expect(getVersionOverride(overrides, 'package-b')).toBe('1.0.0');
  });

  it('should return undefined when no override exists for the package', () => {
    const overrides: Overrides = { 'package-b': '1.0.0' };
    expect(getVersionOverride(overrides, 'package-a')).toBe(undefined);
  });

  it('should return undefined when the override is an object (nested), not a string', () => {
    const overrides: Overrides = { 'package-a': { 'package-b': '1.0.0' } };
    expect(getVersionOverride(overrides, 'package-a')).toBe(undefined);
  });

  it('should return undefined for an empty overrides object', () => {
    expect(getVersionOverride({}, 'package-a')).toBe(undefined);
  });
});

describe('getChildOverrides', () => {
  it('should return global string overrides when child has no nested overrides', () => {
    const rootOverrides: Overrides = {
      'package-c': '2.0.0',
      'package-a': { 'package-b': '1.0.0' },
    };
    const result = getChildOverrides(rootOverrides, rootOverrides, 'package-x');
    expect(result).toStrictEqual({ 'package-c': '2.0.0' });
  });

  it('should merge global string overrides with nested overrides for a child', () => {
    const rootOverrides: Overrides = {
      'package-c': '2.0.0',
      'package-a': { 'package-b': '1.0.0' },
    };
    const result = getChildOverrides(rootOverrides, rootOverrides, 'package-a');
    expect(result).toStrictEqual({
      'package-c': '2.0.0',
      'package-b': '1.0.0',
    });
  });

  it('should return only nested overrides merged with global overrides when entering nested package', () => {
    const rootOverrides: Overrides = {
      'package-a': {
        'package-b': { 'package-c': '3.0.0' },
      },
    };
    // Inside package-a, currentOverrides = { "package-b": { "package-c": "3.0.0" } }
    const insideAOverrides: Overrides = {
      'package-b': { 'package-c': '3.0.0' },
    };
    const result = getChildOverrides(
      insideAOverrides,
      rootOverrides,
      'package-b',
    );
    // Should have package-c: 3.0.0 from the nested overrides
    expect(result).toStrictEqual({ 'package-c': '3.0.0' });
  });

  it('should return empty object when both overrides are empty', () => {
    const result = getChildOverrides({}, {}, 'package-a');
    expect(result).toStrictEqual({});
  });

  it('should not include nested object overrides in global overrides propagation', () => {
    const rootOverrides: Overrides = {
      'package-a': { 'package-b': '1.0.0' },
    };
    // When going into a random package (not package-a), only string globals apply
    // "package-a" has an object value so it's NOT a global override
    const result = getChildOverrides(rootOverrides, rootOverrides, 'package-x');
    expect(result).toStrictEqual({});
  });
});

describe('isOverrides', () => {
  it('should return true for a flat string-valued overrides object', () => {
    expect(isOverrides({ foo: '1.0.0' })).toBe(true);
  });

  it('should return true for a nested overrides object', () => {
    expect(isOverrides({ 'package-a': { 'package-b': '1.0.0' } })).toBe(true);
  });

  it('should return true for an empty object', () => {
    expect(isOverrides({})).toBe(true);
  });

  it('should return false for null', () => {
    expect(isOverrides(null)).toBe(false);
  });

  it('should return false for a non-object value', () => {
    expect(isOverrides('1.0.0')).toBe(false);
    expect(isOverrides(42)).toBe(false);
  });

  it('should return false when a value is neither a string nor an object', () => {
    expect(isOverrides({ foo: 42 })).toBe(false);
  });
});
