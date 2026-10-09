import { rangesIntersect } from 'verkit';

/**
 Utilities for resolving `overrides` in package.json dependency trees.
 See: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides
 */

/**
 Overrides map as defined in package.json `overrides` field.
 */
export type Overrides = {
  [packageName: string]: string | Overrides;
};

/**
 Type guard that checks whether an unknown value is a valid Overrides object.
 */
export function isOverrides(value: unknown): value is Overrides {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  for (const v of Object.values(value)) {
    if (typeof v !== 'string' && !isOverrides(v)) {
      return false;
    }
  }

  return true;
}

/**
 Returns the overridden version for a dependency, if one is defined in the
 current overrides context as a string. Returns undefined if no override
 applies (or if the override is a nested object rather than a version string).

 Keys can include a range (e.g. `{ "foo@^1": "1.2.3" }`), which only applies to
 dependencies whose `spec` intersects that range.
 */
export function getVersionOverride(
  overrides: Overrides,
  name: string,
  spec?: string,
): string | undefined {
  for (const [key, override] of Object.entries(overrides)) {
    if (typeof override !== 'string') {
      continue;
    }

    // Scoped names start with an @, so only look for one after the first character
    const at = key.lastIndexOf('@');
    const keyName = at > 0 ? key.slice(0, at) : key;
    if (keyName !== name) {
      continue;
    }

    if (at <= 0) {
      return override;
    }

    try {
      if (spec !== undefined && rangesIntersect(spec, key.slice(at + 1))) {
        return override;
      }
    } catch {
      // Not a range (tag, URL, etc.), so it can't match
    }
  }

  return undefined;
}

/**
 Replaces `$name` references with the spec that the root package has for that
 dependency. References to unknown dependencies are dropped.
 */
export function resolveOverrideRefs(
  overrides: Overrides,
  rootSpecs: Record<string, string | undefined>,
): Overrides {
  const resolved: Overrides = {};
  for (const [key, value] of Object.entries(overrides)) {
    if (typeof value === 'object') {
      resolved[key] = resolveOverrideRefs(value, rootSpecs);
      continue;
    }

    const spec = value.startsWith('$') ? rootSpecs[value.slice(1)] : value;
    if (spec !== undefined) {
      resolved[key] = spec;
    }
  }

  return resolved;
}

/**
 Computes the effective overrides context for a child package named `childName`
 given the current overrides context and the root overrides.
 
 Root-level string overrides (e.g. `{ "foo": "1.0.0" }`) are applied
 throughout the entire tree. Nested object overrides (e.g. `{ "parent": { "foo":
 "1.0.0" } }`) apply to that parent's whole subtree.
 */
export function getChildOverrides(
  currentOverrides: Overrides,
  rootOverrides: Overrides,
  childName: string,
): Overrides {
  // Collect string overrides: the root ones apply everywhere in the tree, and the
  // current ones (from a parent's nested overrides) apply to the whole subtree
  const stringOverrides: Overrides = {};
  for (const [key, value] of Object.entries({
    ...rootOverrides,
    ...currentOverrides,
  })) {
    if (typeof value === 'string') {
      stringOverrides[key] = value;
    }
  }

  // Merge with any nested overrides defined for this specific child
  const nested = currentOverrides[childName];
  return { ...stringOverrides, ...(typeof nested === 'object' && nested) };
}
