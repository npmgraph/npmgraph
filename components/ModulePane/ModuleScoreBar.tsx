import React from 'react';
import { scoreColor } from '../GraphPane/colorizers/NPMSColorizer.js';
import * as styles from './ModuleScoreBar.module.scss';

export function ModuleScoreBar({
  title,
  score,
  style,
}: {
  title: string;
  score: number;
  style?: React.CSSProperties;
}) {
  const perc = `${(score * 100).toFixed(0)}%`;

  return (
    <>
      <span className={styles.label} style={style}>
        {title}
      </span>
      <div className={styles.bar}>
        <div
          className={styles.inner}
          style={{
            width: perc,
            backgroundColor: scoreColor(score),
            ...style,
          }}
        >
          {perc}
          &ensp;
        </div>
      </div>
    </>
  );
}
