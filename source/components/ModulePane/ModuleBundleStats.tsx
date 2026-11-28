import type { BundlePhobiaData } from '../../lib/fetch-types.ts';
import human from '../../lib/human.ts';
import { Stat, Stats } from './Stats.tsx';

export function ModuleBundleStats({
  bundleInfo,
}: {
  bundleInfo: BundlePhobiaData;
}) {
  return (
    <Stats>
      <Stat label="Minified">{human(bundleInfo.size, 'B')}</Stat>
      <Stat label="Gzipped">{human(bundleInfo.gzip, 'B')}</Stat>
    </Stats>
  );
}
