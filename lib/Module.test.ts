import type { PackumentVersion } from '@npm/types';
import { describe, expect, it } from 'vitest';
import Module from './Module.ts';
import { UNNAMED_PACKAGE, UNNAMED_PACKAGE_PREFIX } from './constants.ts';

describe('Module', () => {
  describe('isUnnamed', () => {
    it('should return false for a module with a regular name', () => {
      const module = new Module({
        name: 'my-package',
        version: '1.0.0',
      } as PackumentVersion);

      expect(module.isUnnamed).toBe(false);
    });

    it('should return true for a module with a generated unnamed prefix', () => {
      const module = new Module({
        name: `${UNNAMED_PACKAGE_PREFIX}abc-123`,
        version: '1.0.0',
      } as PackumentVersion);

      expect(module.isUnnamed).toBe(true);
    });
  });

  describe('displayName', () => {
    it('should return the package name for a named module', () => {
      const module = new Module({
        name: 'my-package',
        version: '1.0.0',
      } as PackumentVersion);

      expect(module.displayName).toBe('my-package');
    });

    it(`should return '${UNNAMED_PACKAGE}' for an unnamed module`, () => {
      const module = new Module({
        name: `${UNNAMED_PACKAGE_PREFIX}abc-123`,
        version: '1.0.0',
      } as PackumentVersion);

      expect(module.displayName).toBe(UNNAMED_PACKAGE);
    });
  });

  describe('constructor', () => {
    it('should throw if name is not provided', () => {
      expect(
        () =>
          new Module({
            version: '1.0.0',
          } as unknown as PackumentVersion),
      ).toThrow(/Package name is required/);
    });
  });
});
