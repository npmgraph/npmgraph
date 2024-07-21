import { useEffect, useState } from 'react';
import type Module from '../../lib/Module.js';
import fetchJSON from '../../lib/fetchJSON.js';
import type { NPMSIOData } from '../../lib/fetch_types.js';
import { ModuleScoreBar } from './ModuleScoreBar.js';

export default function ModuleNpmsIOScores({ module }: { module: Module }) {
  const [npmsData, setNpmsData] = useState<NPMSIOData | Error>();

  useEffect(() => {
    if (module.isLocal) return;

    setNpmsData(undefined);

    fetchJSON<NPMSIOData>(
      `https://api.npms.io/v2/package/${encodeURIComponent(module.name)}`,
      { silent: true, timeout: 5000 },
    )
      .then(data => setNpmsData(data))
      .catch(err => setNpmsData(err));
  }, [module]);

  if (!npmsData) {
    return 'Loading ...';
  }
  if (npmsData instanceof Error) {
    return 'Score not currently available';
  }

  const scores: NPMSIOData['score'] = npmsData.score;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        marginTop: '1em',
        rowGap: '1px',
      }}
    >
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
