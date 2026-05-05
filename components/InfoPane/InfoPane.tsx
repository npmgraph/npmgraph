import type { HTMLProps } from 'react';
import { ExternalLink } from '../ExternalLink.tsx';
import { Pane } from '../Pane.tsx';
import { QueryLink } from '../QueryLink.tsx';
import FilePicker from './FilePicker.tsx';
import QueryInput from './QueryInput.tsx';
import RegistryInput from './RegistryInput.tsx';

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

      <RegistryInput />

      <hr />
      <footer>
        <p>
          <ExternalLink
            href="https://github.com/npmgraph/npmgraph"
            rel="noopener noreferrer"
          >
            GitHub repo
          </ExternalLink>
          {' | '}
          <ExternalLink
            href="https://github.com/sponsors/broofa"
            rel="noopener noreferrer"
          >
            Sponsor
          </ExternalLink>
        </p>
      </footer>
    </Pane>
  );
}
