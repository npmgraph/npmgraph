import React from 'react';
import * as styles from './Intro.module.scss';
import QueryInput from './InfoPane/QueryInput.js';
import InputHelp from './InputHelp.js';
import GitHubCorner from './GitHubCorner.js';
import Logo from './Logo.js';

export default function Intro() {
  return (
    <div className={styles.root}>
      <h1>
        <Logo />
      </h1>
      <h2>Explore npm modules and dependencies</h2>
      <QueryInput />
      <InputHelp />
      <GitHubCorner />
    </div>
  );
}
