import { useEffect, useState } from 'react';
import type Module from '../../lib/Module.ts';
import fetchJSON from '../../lib/fetchJSON.ts';
import type { BundlePhobiaData } from '../../lib/fetch_types.ts';
import { ExternalLink } from '../ExternalLink.tsx';
import { ModuleBundleStats } from './ModuleBundleStats.tsx';
import { ModuleTreeMap } from './ModuleTreeMap.tsx';

export default function ModuleBundleSize({ module }: { module: Module }) {
  const pkg = module.package;

  const [bundleInfo, setBundleInfo] = useState<BundlePhobiaData | Error>();

  const pn = encodeURIComponent(`${pkg.name}@${pkg.version}`);
  const bpUrl = `https://bundlephobia.com/result?p=${pn}`;
  const bpApiUrl = `https://bundlephobia.com/api/size?package=${pn}`;

  useEffect(() => {
    if (module.isLocal) return;

    // eslint-disable-next-line react/set-state-in-effect
    setBundleInfo(undefined);

    let cancelled = false;
    fetchJSON<BundlePhobiaData>(bpApiUrl, { silent: true, timeout: 5000 })
      .then(data => {
        if (!cancelled) setBundleInfo(data);
      })
      .catch(err => {
        if (!cancelled) setBundleInfo(err);
      });
    return () => {
      cancelled = true;
    };
  }, [bpApiUrl, module.isLocal]);

  if (!bundleInfo) {
    return 'Loading ...';
  }

  if (bundleInfo instanceof Error) {
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
