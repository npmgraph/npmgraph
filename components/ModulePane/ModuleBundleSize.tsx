import { Suspense, use, useMemo } from 'react';
import type Module from '../../lib/Module.ts';
import fetchJson from '../../lib/fetchJson.ts';
import type { BundlePhobiaData } from '../../lib/fetch-types.ts';
import { ExternalLink } from '../ui/ExternalLink.tsx';
import { ModuleBundleStats } from './ModuleBundleStats.tsx';
import { ModuleTreeMap } from './ModuleTreeMap.tsx';

export default function ModuleBundleSize({ module }: { module: Module }) {
  if (module.isLocal) {
    return 'Loading ...';
  }

  const { name, version } = module.package;

  return <RemoteModuleBundleSize name={name} version={version} />;
}

async function loadBundleInfo(apiUrl: string) {
  try {
    return await fetchJson<BundlePhobiaData>(apiUrl, {
      silent: true,
      timeout: 5000,
    });
  } catch {
    // Handled by the consumer
  }
}

function RemoteModuleBundleSize({
  name,
  version,
}: {
  name: string;
  version: string;
}) {
  const pn = encodeURIComponent(`${name}@${version}`);
  const bpUrl = `https://bundlephobia.com/result?p=${pn}`;
  const bpApiUrl = `https://bundlephobia.com/api/size?package=${pn}`;

  const bundleInfoPromise = useMemo(
    async () => loadBundleInfo(bpApiUrl),
    [bpApiUrl],
  );

  return (
    <Suspense fallback="Loading ...">
      <BundleInfo promise={bundleInfoPromise} bpUrl={bpUrl} />
    </Suspense>
  );
}

function BundleInfo({
  promise,
  bpUrl,
}: {
  promise: Promise<BundlePhobiaData | undefined>;
  bpUrl: string;
}) {
  const bundleInfo = use(promise);

  if (!bundleInfo) {
    return 'Bundle size not available';
  }

  return (
    <>
      <ModuleBundleStats bundleInfo={bundleInfo} />
      {bundleInfo.dependencyCount > 0 ? (
        <>
          <ModuleTreeMap
            style={{ height: '150px', marginBlock: '1em' }}
            data={bundleInfo}
          />
          Data source: <ExternalLink href={bpUrl}>BundlePhobia</ExternalLink>
        </>
      ) : null}
    </>
  );
}
