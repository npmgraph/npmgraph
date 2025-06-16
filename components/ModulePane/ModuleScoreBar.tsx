import React from 'react';
import { percent } from '../../lib/dom.js';
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
  const perc = percent(score);

  return (
    <>
      <span className={styles.label} style={style}>
        {title}
      </span>
      <div className={styles.bar}>
        <div
          className={styles.inner}
          style={{
            width: percent(score),
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
