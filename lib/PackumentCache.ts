import type { Packument } from '@npm/types';
import { REGISTRY_BASE_URL } from './ModuleCache.js';
import type { PromiseWithResolversType } from './PromiseWithResolvers.js';
import PromiseWithResolvers from './PromiseWithResolvers.js';
import fetchJSON from './fetchJSON.js';

const packumentCache = new Map<string, PackumentCacheEntry>();

export type QueryType = 'exact' | 'name' | 'license' | 'maintainer';

type PackumentCacheEntry = PromiseWithResolversType<Packument | undefined> & {
  packument?: Packument; // Set once packument is loaded
};

export async function getNPMPackument(
  moduleName: string,
): PackumentCacheEntry['promise'] {
  let cacheEntry = packumentCache.get(moduleName);
  if (!cacheEntry) {
    cacheEntry = PromiseWithResolvers() as PackumentCacheEntry;
    packumentCache.set(moduleName, cacheEntry);

    await fetchJSON<Packument>(`${REGISTRY_BASE_URL}/${moduleName}`, {
      // Per
      // https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
      // we should arguably be using the 'Accept:
      // application/vnd.npm.install-v1+json' header to reduce the request size.
      // But that doesn't actually work.
      //
      // REF: https://github.com/npm/feedback/discussions/1014
      //
      // So instead we're sending 'application/json'.  The responses are smaller
      // and we get full "version" objects, so we don't have to send follow-up
      // requests.
      headers: { Accept: 'application/json' },
    })
      .catch(err => {
        console.warn(
          `Failed to fetch packument for ${moduleName}`,
          err.message,
        );
        return undefined;
      })
      .then(cacheEntry.resolve);
  }

  return cacheEntry.promise;
}

export function getCachedPackument(moduleName: string): Packument | undefined {
  return packumentCache.get(moduleName)?.packument;
}

export function cachePackument(moduleName: string, packument: Packument): void {
  let cacheEntry = packumentCache.get(moduleName);
  if (!cacheEntry) {
    cacheEntry = PromiseWithResolvers() as PackumentCacheEntry;
    packumentCache.set(moduleName, cacheEntry);
    cacheEntry.resolve(packument);
  }
}
