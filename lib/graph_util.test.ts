import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { getChildOverrides, getVersionOverride } from './overrides_util.ts';
import type { Overrides } from './overrides_util.ts';

describe('getVersionOverride', () => {
  it('should return the overridden version when a string override exists', () => {
    const overrides: Overrides = { 'package-b': '1.0.0' };
    assert.equal(getVersionOverride(overrides, 'package-b'), '1.0.0');
  });

  it('should return undefined when no override exists for the package', () => {
    const overrides: Overrides = { 'package-b': '1.0.0' };
    assert.equal(getVersionOverride(overrides, 'package-a'), undefined);
  });

  it('should return undefined when the override is an object (nested), not a string', () => {
    const overrides: Overrides = { 'package-a': { 'package-b': '1.0.0' } };
    assert.equal(getVersionOverride(overrides, 'package-a'), undefined);
  });

  it('should return undefined for an empty overrides object', () => {
    assert.equal(getVersionOverride({}, 'package-a'), undefined);
  });
});

describe('getChildOverrides', () => {
  it('should return global string overrides when child has no nested overrides', () => {
    const rootOverrides: Overrides = {
      'package-c': '2.0.0',
      'package-a': { 'package-b': '1.0.0' },
    };
    const result = getChildOverrides(rootOverrides, rootOverrides, 'package-x');
    assert.deepEqual(result, { 'package-c': '2.0.0' });
  });

  it('should merge global string overrides with nested overrides for a child', () => {
    const rootOverrides: Overrides = {
      'package-c': '2.0.0',
      'package-a': { 'package-b': '1.0.0' },
    };
    const result = getChildOverrides(rootOverrides, rootOverrides, 'package-a');
    assert.deepEqual(result, { 'package-c': '2.0.0', 'package-b': '1.0.0' });
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
    assert.deepEqual(result, { 'package-c': '3.0.0' });
  });

  it('should return empty object when both overrides are empty', () => {
    const result = getChildOverrides({}, {}, 'package-a');
    assert.deepEqual(result, {});
  });

  it('should not include nested object overrides in global overrides propagation', () => {
    const rootOverrides: Overrides = {
      'package-a': { 'package-b': '1.0.0' },
    };
    // When going into a random package (not package-a), only string globals apply
    // "package-a" has an object value so it's NOT a global override
    const result = getChildOverrides(rootOverrides, rootOverrides, 'package-x');
    assert.deepEqual(result, {});
  });
});
