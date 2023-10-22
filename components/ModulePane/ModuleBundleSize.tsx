import React, { useEffect, useState } from 'react';
import Module from '../../lib/Module.js';
import fetchJSON from '../../lib/fetchJSON.js';
import { BundlePhobiaData } from '../../lib/fetch_types.js';
import { ExternalLink } from '../ExternalLink.js';
import { ModuleBundleStats } from './ModuleBundleStats.js';
import './ModulePane.scss';
import { ModuleTreeMap } from './ModuleTreeMap.js';

export default function ModuleBundleSize({ module }: { module: Module }) {
  const pkg = module.package;

  const [bundleInfo, setBundleInfo] = useState<BundlePhobiaData | Error>();

  const pn = encodeURIComponent(`${pkg.name}@${pkg.version}`);
  const bpUrl = `https://bundlephobia.com/result?p=${pn}`;
  const bpApiUrl = `https://bundlephobia.com/api/size?package=${pn}`;

  useEffect(() => {
    if (module.isLocal) return;

    setBundleInfo(undefined);

    if (!pkg) return;

    fetchJSON<BundlePhobiaData>(bpApiUrl, { silent: true, timeout: 5000 })
      .then(data => setBundleInfo(data))
      .catch(err => setBundleInfo(err));
  }, [pkg]);

  return (
    <>
      {!bundleInfo ? (
        'Loading ...'
      ) : bundleInfo instanceof Error ? (
        'Bundle size not currently available'
      ) : (
        <>
          <ModuleBundleStats bundleInfo={bundleInfo} />
          <ModuleTreeMap
            style={{ height: '150px', margin: '1em' }}
            data={bundleInfo}
          />
          Data source: <ExternalLink href={bpUrl}>BundlePhobia</ExternalLink>
        </>
      )}
    </>
  );
}
