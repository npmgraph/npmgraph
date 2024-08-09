import React from 'react';
import { QueryLink } from './QueryLink.js';

export default function InputHelp() {
  return (
    <>
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
      </ul>
    </>
  );
}
