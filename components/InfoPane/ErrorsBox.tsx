import { useQuery } from '../../hooks/useQuery.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { ExternalLink } from '../ui/ExternalLink.tsx';
import * as styles from './ErrorsBox.module.scss';

function isGithubUrl(url: URL) {
  return /^github.com$|\.github.com$/.test(url.host);
}

// Errors of the modules in the query that failed to load
export default function ErrorsBox() {
  const [query] = useQuery();
  const [graph] = useGlobalState('graph');
  const errors = [...graph.failedEntryModules].filter(([key]) =>
    query.includes(key),
  );

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className={styles.error}>
      {errors.map(([key, error]) => {
        const url = URL.parse(key);
        return (
          <div key={key}>
            <p>{error.message}</p>
            {url ? (
              <p>
                {url.host} must allow CORS requests from the {location.host}{' '}
                domain for this to work.
              </p>
            ) : null}
            {url && isGithubUrl(url) ? (
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
        );
      })}
    </div>
  );
}
