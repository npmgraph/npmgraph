import React, { HTMLProps } from 'react';
import { isDefined } from '../../lib/guards.js';
import { useQuery } from '../App.js';
import { ExternalLink } from '../ExternalLink.js';
import './QueryInput.scss';

export default function QueryInput(props: HTMLProps<HTMLInputElement>) {
  const [query, setQuery] = useQuery();
  const [value, setValue] = React.useState(query.join(', '));
  let url: URL | undefined = undefined;

  try {
    url = new URL(value.trim());
  } catch (err) {
    // ignore
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!/^(?:Enter|Tab)$/.test(e.key)) return;

    const names = (e.currentTarget as HTMLInputElement).value
      .split(',')
      .map(v => v.trim())
      .filter(isDefined);
    const query = [...new Set(names)]; // De-dupe

    setQuery(query);
  }

  return (
    <>
      <input
        type="text"
        id="search-field"
        value={value}
        onKeyDown={handleKeyDown}
        onChange={e => setValue(e.target.value)}
        autoFocus
        {...props}
      />
      {isGithubUrl(url) ? (
        <div className="tip">
          Note: Files in private GitHub repos must use the URL shown when{' '}
          <ExternalLink href="https://docs.github.com/en/enterprise-cloud@latest/repositories/working-with-files/using-files/viewing-a-file#viewing-or-copying-the-raw-file-content">
            viewing the "Raw" file
          </ExternalLink>
          .
        </div>
      ) : null}
      {url ? (
        <div className="tip">
          Note: {url.host} must allow CORS requests from the {location.host}{' '}
          domain for this to work
        </div>
      ) : null}
    </>
  );
}

function isGithubUrl(url?: URL) {
  return /\.?github.com$/.test(url?.host ?? '');
}
