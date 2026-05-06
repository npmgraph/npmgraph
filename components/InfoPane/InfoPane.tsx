import type { HTMLProps } from 'react';
import { cn } from '../../lib/dom.ts';
import { useParsedQuery } from '../../lib/useQuery.ts';
import { ExternalLink } from '../ExternalLink.tsx';
import { Pane } from '../Pane.tsx';
import { QueryLink } from '../QueryLink.tsx';
import FilePicker from './FilePicker.tsx';
import * as styles from './InfoPane.module.scss';

function isGithubUrl(url: URL | null) {
  if (!url) return false;
  return /^github.com$|\.github.com$/.test(url?.host ?? '');
}

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  const [value] = useParsedQuery();
  const valueAsURL = URL.parse(value.trim());

  return (
    <Pane {...props}>
      {isGithubUrl(valueAsURL) ? (
        <div className={styles.tip}>
          Note: URLs that refer to private GitHub repos or gists should use the
          URL shown when{' '}
          <ExternalLink href="https://docs.github.com/en/enterprise-cloud@latest/repositories/working-with-files/using-files/viewing-a-file#viewing-or-copying-the-raw-file-content">
            viewing the "Raw" file
          </ExternalLink>
          .
        </div>
      ) : null}
      {valueAsURL ? (
        <div className={styles.tip}>
          Note: {valueAsURL.host} must allow CORS requests from the{' '}
          {location.host} domain for this to work
        </div>
      ) : null}

      <p>npmgraph supports looking up:</p>

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
            className={cn('bright-hover', 'external-link')}
          >
            GitHub repo
          </a>
          {' | '}
          <a
            href="https://github.com/sponsors/broofa"
            target="_blank"
            rel="noopener noreferrer"
            className={cn('bright-hover', 'external-link')}
          >
            Sponsor
          </a>
        </p>
      </footer>
    </Pane>
  );
}
