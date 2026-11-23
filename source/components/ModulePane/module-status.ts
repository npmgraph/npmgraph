import type Module from '../../lib/Module.ts';
import { getVersionStatus } from '../../lib/version-status.ts';

export function getStatus(module: Module) {
  return module.packument
    ? getVersionStatus(module.version, module.packument['dist-tags'])
    : undefined;
}

export function isOutdated(module: Module) {
  return getStatus(module)?.type === 'outdated';
}
