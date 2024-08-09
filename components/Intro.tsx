import React from 'react';
import * as styles from './Intro.module.scss';
import QueryInput from './InfoPane/QueryInput.js';
import { QueryLink } from './QueryLink.js';

export default function Intro() {
  return (
    <div className={styles.root}>
      <h1>
        npm<span className="link">graph</span>
      </h1>
      <h2>A tool for exploring npm modules and dependencies</h2>
      <QueryInput />

      <p>For example:</p>

      <ul>
        <li>
          A npm module name: <QueryLink query={['express']} />
        </li>
        <li>
          Multiple, versioned module names:{' '}
          <QueryLink query={['cross-env@6', 'rimraf']} />
        </li>
        <li>
          A URL to a{' '}
          <QueryLink query="https://github.com/npmgraph/npmgraph/blob/main/package.json">
            package.json file
          </QueryLink>
        </li>
        <li>package.json pastes (copied as text or file)</li>
      </ul>
    </div>
  );
}
