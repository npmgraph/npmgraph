import { useEffect, useState } from 'react';
import { cn } from '../../lib/dom.ts';
import type { NpmDownloadsPoint } from '../../lib/fetch-types.ts';
import fetchJson from '../../lib/fetchJson.ts';
import human from '../../lib/human.ts';
import type Module from '../../lib/Module.ts';
import * as styles from './ModuleDownloads.module.scss';

export type PopularityTier = {
  tier: 0 | 1 | 2 | 3 | 4 | 5;
  bars: number;
  label: string;
};

export function getPopularityTier(downloads: number): PopularityTier {
  if (downloads >= 100_000_000) {
    return { tier: 5, bars: 5, label: 'Superstar (100M+/wk)' };
  }

  if (downloads >= 10_000_000) {
    return { tier: 4, bars: 4, label: 'Extremely popular (10M–100M/wk)' };
  }

  if (downloads >= 1_000_000) {
    return { tier: 3, bars: 3, label: 'Very popular (1M–10M/wk)' };
  }

  if (downloads >= 100_000) {
    return { tier: 2, bars: 2, label: 'Popular (100k–1M/wk)' };
  }

  return downloads >= 10_000
    ? { tier: 1, bars: 1, label: 'Moderate (10k–100k/wk)' }
    : { tier: 0, bars: 0, label: 'Niche (<10k/wk)' };
}

export function formatWeeklyDownloads(downloads: number): string {
  const h = human(downloads, '', 2).trim();
  return h.replaceAll(/\s+/g, '');
}

const METER_BAR_HEIGHTS = [4, 7, 10, 13, 16];

export function ModuleDownloads({ module }: { module: Module }) {
  return module.isLocal || module.isUnnamed ? null : (
    <RemoteModuleDownloads key={module.name} name={module.name} />
  );
}

function RemoteModuleDownloads({ name }: { name: string }) {
  const [data, setData] = useState<NpmDownloadsPoint | Error>();

  const apiUrl = `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`;

  useEffect(() => {
    fetchJson<NpmDownloadsPoint>(apiUrl, { silent: true, timeout: 5000 })
      .then(response => {
        setData(response);
      })
      .catch(error => {
        setData(error);
      });
  }, [apiUrl]);

  if (!data || data instanceof Error || typeof data.downloads !== 'number') {
    return null;
  }

  const { downloads } = data;
  const tier = getPopularityTier(downloads);
  const formatted = formatWeeklyDownloads(downloads);
  const title = `${downloads.toLocaleString()} weekly downloads (${tier.label})`;

  return (
    <div className={styles.downloads} title={title}>
      <span>Weekly downloads:</span>
      <strong className={styles.count}>{formatted}</strong>
      <span className={styles.meter} aria-label={title} role="img">
        {METER_BAR_HEIGHTS.map((height, i) => (
          <span
            key={height}
            className={cn(
              styles.meterBar,
              i < tier.bars ? styles.filled : undefined,
            )}
            style={{ height }}
          />
        ))}
      </span>
    </div>
  );
}
