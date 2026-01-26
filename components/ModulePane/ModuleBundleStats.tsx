import type { BundlePhobiaData } from '../../lib/fetch_types.ts';
import human from '../../lib/human.ts';

export function ModuleBundleStats({
  bundleInfo,
}: {
  bundleInfo: BundlePhobiaData;
}) {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0 1em' }}
    >
      <span>Bundle size (minified):</span>
      <strong>{human(bundleInfo.size, 'B')}</strong>
      <span>Bundle size (compressed):</span>
      <strong>{human(bundleInfo.gzip, 'B')}</strong>
    </div>
  );
}
