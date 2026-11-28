import type { CSSProperties } from 'react';
import type { BundlePhobiaData } from '../../lib/fetch-types.ts';
import human from '../../lib/human.ts';
import * as styles from './ModuleBundleStats.module.css';

// The bar is the minified size, its filled part is what's left after gzip
export function ModuleBundleStats({
  bundleInfo: { size, gzip },
}: {
  bundleInfo: BundlePhobiaData;
}) {
  return (
    <div className={styles.root}>
      <span className={styles.label}>Bundle size</span>
      <div
        className={styles.bar}
        style={
          { '--gzip': `${size ? (gzip / size) * 100 : 0}%` } as CSSProperties
        }
      />
      <div className={styles.legend}>
        <span>
          <strong>{human(gzip, 'B')}</strong> gzipped
        </span>
        <span>
          <strong>{human(size, 'B')}</strong> minified
        </span>
      </div>
    </div>
  );
}
