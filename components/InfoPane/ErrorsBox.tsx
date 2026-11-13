import { cn } from '../../lib/dom.ts';
import { useQuery } from '../../hooks/useQuery.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import XIcon from '../../images/icons/x.svg?react';
import { ExternalLink } from '../ui/ExternalLink.tsx';
import * as utilities from '../ui/utilities.module.css';
import * as styles from './ErrorsBox.module.css';

function isGithubUrl(url: URL) {
  return /^github.com$|\.github.com$/.test(url.host);
}

// Errors of the modules in the query that failed to load
export default function ErrorsBox() {
  const [query, setQuery] = useQuery();
  const [graph] = useGlobalState('graph');
  const errors = [...graph.failedEntryModules].filter(([key]) =>
    query.includes(key),
  );

  if (errors.length === 0) {
    return null;
  }

  const failed = new Set(errors.map(([key]) => key));
  const urls = errors.flatMap(([key]) => URL.parse(key) ?? []);
  const hosts = [...new Set(urls.map(url => url.host))];

  return (
    <div className={styles.error} role="alert">
      <div className={styles.messages}>
        {errors.map(([key, error]) => (
          <p key={key}>{error.message}</p>
        ))}
        {hosts.length > 0 && (
          <p>
            {hosts.join(', ')} must allow CORS requests from the {location.host}{' '}
            domain for this to work.
          </p>
        )}
        {urls.some(url => isGithubUrl(url)) && (
          <p>
            URLs that refer to private GitHub repos or gists should use the URL
            shown when{' '}
            <ExternalLink href="https://docs.github.com/en/enterprise-cloud@latest/repositories/working-with-files/using-files/viewing-and-understanding-files#viewing-or-copying-the-raw-file-content">
              viewing the "Raw" file
            </ExternalLink>
          </p>
        )}
      </div>
      {query.some(key => !failed.has(key)) && (
        <button
          type="button"
          aria-label="Remove the failing modules from the query"
          className={cn(styles.dismiss, utilities.brightHoverBackdrop)}
          onClick={() => {
            setQuery(query.filter(key => !failed.has(key)));
          }}
        >
          <XIcon />
        </button>
      )}
    </div>
  );
}
