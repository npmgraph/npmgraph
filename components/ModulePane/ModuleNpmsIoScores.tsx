import { useEffect, useState } from 'react';
import type Module from '../../lib/Module.ts';
import fetchJson from '../../lib/fetchJson.ts';
import type { NPMSIOData } from '../../lib/fetch_types.ts';
import { ModuleScoreBar } from './ModuleScoreBar.tsx';
import * as styles from './ModuleNpmsIoScores.module.scss';

export default function ModuleNpmsIoScores({ module }: { module: Module }) {
  const [npmsData, setNpmsData] = useState<NPMSIOData | Error>();

  useEffect(() => {
    if (module.isLocal) return;

    setNpmsData(undefined);

    fetchJson<NPMSIOData>(
      `https://api.npms.io/v2/package/${encodeURIComponent(module.name)}`,
      { silent: true, timeout: 5000 },
    )
      .then(data => {
        setNpmsData(data);
      })
      .catch(error => {
        setNpmsData(error);
      });
  }, [module]);

  if (!npmsData) {
    return 'Loading ...';
  }
  if (npmsData instanceof Error) {
    return 'Score not available';
  }

  const scores: NPMSIOData['score'] = npmsData.score;

  return (
    <div className={styles.scoreGrid}>
      <ModuleScoreBar
        style={{ fontWeight: 'bold' }}
        title="Overall"
        score={scores.final}
      />
      <ModuleScoreBar
        style={{ fontSize: '.85em' }}
        title="Quality"
        score={scores.detail.quality}
      />
      <ModuleScoreBar
        style={{ fontSize: '.85em' }}
        title="Popularity"
        score={scores.detail.popularity}
      />
      <ModuleScoreBar
        style={{ fontSize: '.85em' }}
        title="Maintenance"
        score={scores.detail.maintenance}
      />
    </div>
  );
}
