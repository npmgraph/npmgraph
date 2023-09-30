import { PackageJson } from '@npm/types';
import { useEffect } from 'react';
import { ModulePackage } from '../lib/Module.js';
import { cacheLocalPackage } from '../lib/ModuleCache.js';
import { PACKAGES_PARAM } from '../lib/constants.js';
import { flash } from '../lib/flash.js';
import useHashParam from '../lib/useHashParam.js';

type PachagesHash = PackageJson[];

export default function PackagesHashHAndler() {
  const [hashPackages] = useHashParam(PACKAGES_PARAM);

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
      flash(`"${PACKAGES_PARAM}" param could not be parsed`);
      return;
    }
  }, [hashPackages]);

  return null;
}
