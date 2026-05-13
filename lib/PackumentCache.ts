import type { Packument } from '@npm/types';
import type { PromiseWithResolversType } from './promiseWithResolvers.ts';
import promiseWithResolvers from './promiseWithResolvers.ts';
import fetchJson from './fetchJson.ts';
import { getRegistry } from './useRegistry.ts';

const packumentCache = new Map<string, PackumentCacheEntry>();

type PackumentCacheEntry = PromiseWithResolversType<Packument | undefined> & {
  packument?: Packument; // Set once packument is loaded
  registry?: string; // NPM_REGISTRY url
};

export async function getNPMPackument(
  moduleName: string,
): PackumentCacheEntry['promise'] {
  const registry = getRegistry();

  let cacheEntry = packumentCache.get(moduleName);
  // Invalidate cache if registry has changed
  if (cacheEntry?.registry && cacheEntry.registry !== registry) {
    cacheEntry = undefined;
  }

  if (!cacheEntry) {
    cacheEntry = promiseWithResolvers();
    cacheEntry.registry = registry;
    packumentCache.set(moduleName, cacheEntry);

    await fetchJson<Packument>(`${registry}/${moduleName}`, {
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
      .catch(error => {
        console.warn('Failed to fetch packument', moduleName, error.message);
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
    cacheEntry = promiseWithResolvers();
    packumentCache.set(moduleName, cacheEntry);
    cacheEntry.resolve(packument);
  }
}
