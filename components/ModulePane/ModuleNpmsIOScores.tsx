import React, { useEffect, useState } from 'react';
import Module from '../../lib/Module.js';
import fetchJSON from '../../lib/fetchJSON.js';
import { NPMSIOData } from '../../lib/fetch_types.js';
import { ModuleScoreBar } from './ModuleScoreBar.js';

export default function ModuleNpmsIOScores({ module }: { module: Module }) {
  const [npmsData, setNpmsData] = useState<NPMSIOData | Error>();

  const pkg = module?.package;
  const isLocalModule = Boolean(pkg?._local);

  useEffect(() => {
    if (isLocalModule) return;

    setNpmsData(undefined);

    if (!pkg) return;

    fetchJSON<NPMSIOData>(
      `https://api.npms.io/v2/package/${encodeURIComponent(pkg.name)}`,
      { silent: true, timeout: 5000 },
    )
      .then(data => setNpmsData(data))
      .catch(err => setNpmsData(err));
  }, [pkg]);

  if (!npmsData) {
    return 'Loading ...';
  } else if (npmsData instanceof Error) {
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
