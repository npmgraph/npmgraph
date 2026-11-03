import type { HTMLProps } from 'react';
import { cn } from '../../lib/dom.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { useParsedQuery } from '../../hooks/useQuery.ts';
import { ExternalLink } from '../ui/ExternalLink.tsx';
import { Pane } from '../ui/Pane.tsx';
import InputHelp from '../InputHelp.tsx';
import * as utilities from '../ui/utilities.module.scss';
import FilePicker from './FilePicker.tsx';
import * as styles from './InfoPane.module.scss';

function isGithubUrl(url: URL | null) {
  return Boolean(url && /^github.com$|\.github.com$/.test(url.host));
}

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  const [value] = useParsedQuery();
  const [graph] = useGlobalState('graph');
  const valueAsURL = URL.parse(value.trim());

  return (
    <Pane {...props}>
      {valueAsURL && graph.failedEntryModules.has(value.trim()) ? (
        <div className={styles.error}>
          <p>
            {valueAsURL.host} must allow CORS requests from the {location.host}{' '}
            domain for this to work.
          </p>
          {isGithubUrl(valueAsURL) ? (
            <p>
              URLs that refer to private GitHub repos or gists should use the
              URL shown when{' '}
              <ExternalLink href="https://docs.github.com/en/enterprise-cloud@latest/repositories/working-with-files/using-files/viewing-and-understanding-files#viewing-or-copying-the-raw-file-content">
                viewing the "Raw" file
              </ExternalLink>
              .
            </p>
          ) : null}
        </div>
      ) : null}

      <InputHelp heading="npmgraph supports looking up:" />

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
            className={cn(utilities.brightHover, 'external-link')}
          >
            GitHub repo
          </a>
          {' | '}
          <a
            href="https://github.com/sponsors/broofa"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(utilities.brightHover, 'external-link')}
          >
            Sponsor
          </a>
        </p>
      </footer>
    </Pane>
  );
}
