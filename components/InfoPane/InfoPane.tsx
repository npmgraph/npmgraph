import React, { type HTMLProps } from 'react';
import { Pane } from '../Pane.js';
import { QueryLink } from '../QueryLink.js';
import FileUploadControl from './FileUploadControl.js';
import QueryInput from './QueryInput.js';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <h3>Generate npmgraph:</h3>

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
      </ul>

      <FileUploadControl />
    </Pane>
  );
}
