import React, { type HTMLProps } from 'react';
import { Pane } from '../Pane.js';
import { QueryLink } from '../QueryLink.js';
import FilePicker from './FilePicker.js';
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

      <p>It also accepts package.json:</p>
      <ul>
        <li>Drag and drop a file anywhere on the page</li>
        <li>Paste package.json (file or text)</li>
        <li>
          <FilePicker label="Choose file" /> from your computer
        </li>
      </ul>

      <hr />
      <footer>
        <p>
          <a
            href="https://github.com/npmgraph/npmgraph"
            target="_blank"
            rel="noopener noreferrer"
            className="bright-hover external-link"
          >
            GitHub repo
          </a>
          {' | '}
          <a
            href="https://github.com/sponsors/broofa"
            target="_blank"
            rel="noopener noreferrer"
            className="bright-hover external-link"
          >
            Sponsor
          </a>
        </p>
      </footer>
    </Pane>
  );
}
