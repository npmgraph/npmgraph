import { useEffect } from 'react';
import { ModulePackage } from '../lib/Module.js';
import { cacheLocalPackage } from '../lib/ModuleCache.js';
import { flash } from '../lib/flash.js';
import useHashParam from '../lib/useHashParam.js';
import { useQuery } from './App.js';

const PACKAGE_HASH_PARAM = 'package_json';

export default function HashUploader() {
  const [hashPackage, setHashPackage] = useHashParam(PACKAGE_HASH_PARAM);

  const [, setQuery] = useQuery();

  useEffect(() => {
    // Stop if there's no hash package to ingest
    if (!hashPackage) return;

    // Clear the hash param now that we have the package content
    setHashPackage('');

    // Parse package out of hash param
    let pkg: ModulePackage;
    try {
      pkg = JSON.parse(hashPackage);
    } catch (err) {
      flash('Package contents in URL could not be parsed');
      return;
    }

    // Push it into our module cache
    const module = cacheLocalPackage(pkg);

    setQuery([module.key]);
  }, [hashPackage]);

  return null;
}
