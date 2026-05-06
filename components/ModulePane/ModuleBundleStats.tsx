import type { BundlePhobiaData } from '../../lib/fetch_types.ts';
import human from '../../lib/human.ts';
import * as styles from './ModuleBundleStats.module.scss';

export function ModuleBundleStats({
  bundleInfo,
}: {
  bundleInfo: BundlePhobiaData;
}) {
  return (
    <div className={styles.root}>
      <span>Bundle size (minified):</span>
      <strong>{human(bundleInfo.size, 'B')}</strong>
      <span>Bundle size (compressed):</span>
      <strong>{human(bundleInfo.gzip, 'B')}</strong>
    </div>
  );
}
