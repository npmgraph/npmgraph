import type { PackumentVersion } from '@npm/types';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import Module from './Module.ts';
import { UNNAMED_PACKAGE, UNNAMED_PACKAGE_PREFIX } from './constants.ts';

void describe('Module', () => {
  void describe('isUnnamed', () => {
    void it('should return false for a module with a regular name', () => {
      const module = new Module({
        name: 'my-package',
        version: '1.0.0',
      } as PackumentVersion);

      assert.equal(module.isUnnamed, false);
    });

    void it('should return true for a module with a generated unnamed prefix', () => {
      const module = new Module({
        name: `${UNNAMED_PACKAGE_PREFIX}abc-123`,
        version: '1.0.0',
      } as PackumentVersion);

      assert.equal(module.isUnnamed, true);
    });
  });

  void describe('displayName', () => {
    void it('should return the package name for a named module', () => {
      const module = new Module({
        name: 'my-package',
        version: '1.0.0',
      } as PackumentVersion);

      assert.equal(module.displayName, 'my-package');
    });

    void it(`should return '${UNNAMED_PACKAGE}' for an unnamed module`, () => {
      const module = new Module({
        name: `${UNNAMED_PACKAGE_PREFIX}abc-123`,
        version: '1.0.0',
      } as PackumentVersion);

      assert.equal(module.displayName, UNNAMED_PACKAGE);
    });
  });

  void describe('constructor', () => {
    void it('should throw if name is not provided', () => {
      assert.throws(
        () =>
          new Module({
            version: '1.0.0',
          } as unknown as PackumentVersion),
        /Package name is required/,
      );
    });
  });
});
