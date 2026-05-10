/**
 * Utilities for resolving `overrides` in package.json dependency trees.
 * See: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides
 */

/**
 * Overrides map as defined in package.json `overrides` field.
 */
export type Overrides = {
  [packageName: string]: string | Overrides;
};

/**
 * Type guard that checks whether an unknown value is a valid Overrides object.
 */
export function isOverrides(value: unknown): value is Overrides {
  if (typeof value !== 'object' || value === null) return false;
  for (const v of Object.values(value)) {
    if (typeof v !== 'string' && !isOverrides(v)) return false;
  }
  return true;
}

/**
 * Returns the overridden version for a dependency, if one is defined in the
 * current overrides context as a string. Returns undefined if no override
 * applies (or if the override is a nested object rather than a version string).
 */
export function getVersionOverride(
  overrides: Overrides,
  name: string,
): string | undefined {
  const override = overrides[name];
  return typeof override === 'string' ? override : undefined;
}

/**
 * Computes the effective overrides context for a child package named `childName`
 * given the current overrides context and the root overrides.
 *
 * Root-level string overrides (e.g. `{ "foo": "1.0.0" }`) are applied
 * throughout the entire tree. Nested object overrides (e.g. `{ "parent": { "foo":
 * "1.0.0" } }`) only apply within that parent's subtree.
 */
export function getChildOverrides(
  currentOverrides: Overrides,
  rootOverrides: Overrides,
  childName: string,
): Overrides {
  // Collect root-level string overrides — these apply everywhere in the tree
  const rootStringOverrides: Overrides = {};
  for (const [key, value] of Object.entries(rootOverrides)) {
    if (typeof value === 'string') {
      rootStringOverrides[key] = value;
    }
  }

  // Merge with any nested overrides defined for this specific child
  const nested = currentOverrides[childName];
  if (typeof nested === 'object' && nested !== null) {
    return { ...rootStringOverrides, ...nested };
  }

  return rootStringOverrides;
}
