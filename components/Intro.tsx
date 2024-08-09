import React from 'react';
import * as styles from './Intro.module.scss';
import QueryInput from './InfoPane/QueryInput.js';
import InputHelp from './InputHelp.js';
import GitHubCorner from './GitHubCorner.js';

export default function Intro() {
  return (
    <div className={styles.root}>
      <h1>
        npm<span className="link">graph</span>
      </h1>
      <h2>A tool for exploring npm modules and dependencies</h2>
      <QueryInput />
      <InputHelp />
      <GitHubCorner />
    </div>
  );
}
