import React from 'react';
import { BundlePhobiaData } from '../../lib/fetch_types.js';
import human from '../../lib/human.js';

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
