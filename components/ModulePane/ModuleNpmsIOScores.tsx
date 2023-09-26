import React from 'react';
import { NPMSIOData } from '../../lib/fetch_types.js';
import { ModuleScoreBar } from './ModuleScoreBar.js';

export function ModuleNpmsIOScores({
  scores,
}: {
  scores: NPMSIOData['score'];
}) {
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
