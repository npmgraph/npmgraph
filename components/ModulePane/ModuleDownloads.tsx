import { Suspense, use } from 'react';
import usePromise from '../../hooks/usePromise.ts';
import { cn } from '../../lib/dom.ts';
import type { NpmDownloadsPoint } from '../../lib/fetch-types.ts';
import {
  getPopularityTier,
  formatWeeklyDownloads,
} from '../../lib/downloads-util.ts';
import fetchJson from '../../lib/fetchJson.ts';
import type Module from '../../lib/Module.ts';
import * as styles from './ModuleDownloads.module.scss';

const METER_BAR_HEIGHTS = [4, 7, 10, 13, 16];

export function ModuleDownloads({ module }: { module: Module }) {
  return module.isLocal || module.isUnnamed ? null : (
    <RemoteModuleDownloads key={module.name} name={module.name} />
  );
}

async function loadDownloads(apiUrl: string) {
  try {
    return await fetchJson<NpmDownloadsPoint>(apiUrl, {
      silent: true,
      timeout: 5000,
    });
  } catch {
    // Handled by the consumer
    return undefined;
  }
}

function RemoteModuleDownloads({ name }: { name: string }) {
  const apiUrl = `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`;
  const promise = usePromise(apiUrl, async () => loadDownloads(apiUrl));

  return (
    <Suspense fallback={null}>
      <Downloads promise={promise} />
    </Suspense>
  );
}

function Downloads({
  promise,
}: {
  promise: Promise<NpmDownloadsPoint | undefined>;
}) {
  const data = use(promise);

  if (typeof data?.downloads !== 'number') {
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
