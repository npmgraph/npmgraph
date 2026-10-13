import { useEffect, useState } from 'react';
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

  // The key resets the state when the module changes
  return (
    <RemoteModuleBundleSize
      key={`${name}@${version}`}
      name={name}
      version={version}
    />
  );
}

function RemoteModuleBundleSize({
  name,
  version,
}: {
  name: string;
  version: string;
}) {
  const [bundleInfo, setBundleInfo] = useState<BundlePhobiaData | Error>();

  const pn = encodeURIComponent(`${name}@${version}`);
  const bpUrl = `https://bundlephobia.com/result?p=${pn}`;
  const bpApiUrl = `https://bundlephobia.com/api/size?package=${pn}`;

  useEffect(() => {
    fetchJson<BundlePhobiaData>(bpApiUrl, { silent: true, timeout: 5000 })
      .then(data => {
        setBundleInfo(data);
      })
      .catch(error => {
        setBundleInfo(error);
      });
  }, [bpApiUrl]);

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
