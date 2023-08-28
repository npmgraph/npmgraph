import React from 'react';
import { human } from '../util.js';
import { BundlePhobiaData } from '../fetch_types.js';

export function ModuleBundleStats({
  bundleInfo,
}: {
  bundleInfo: BundlePhobiaData;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '.3em 1em',
      }}
    >
      <span>Minified:</span>
      <strong>{human(bundleInfo.size, 'B')}</strong>
      <span>Gzipped:</span>
      <strong>{human(bundleInfo.gzip, 'B')}</strong>
    </div>
  );
}
