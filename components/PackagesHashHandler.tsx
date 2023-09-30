import { PackageJson } from '@npm/types';
import { useEffect } from 'react';
import { ModulePackage } from '../lib/Module.js';
import { cacheLocalPackage } from '../lib/ModuleCache.js';
import { PARAM_PACKAGES } from '../lib/constants.js';
import { flash } from '../lib/flash.js';
import useHashParam from '../lib/useHashParam.js';

type PachagesHash = PackageJson[];

export default function PackagesHashHandler() {
  const [hashPackages] = useHashParam(PARAM_PACKAGES);

  useEffect(() => {
    let packages: PachagesHash;

    if (!hashPackages) return;

    try {
      // Parse package out of hash param
      packages = JSON.parse(hashPackages);
      for (const pkg of packages) {
        cacheLocalPackage(pkg as ModulePackage);
      }
    } catch (err) {
      flash(`"${PARAM_PACKAGES}" param could not be parsed`);
      return;
    }
  }, [hashPackages]);

  return null;
}
