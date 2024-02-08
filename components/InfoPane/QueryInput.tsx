import React, { HTMLProps, useState } from 'react';
import URLPlus from '../../lib/URLPlus.js';
import { UNNAMED_PACKAGE } from '../../lib/constants.js';
import { isDefined } from '../../lib/guards.js';
import useLocation from '../../lib/useLocation.js';
import { useQuery } from '../../lib/useQuery.js';
import { ExternalLink } from '../ExternalLink.js';
import './QueryInput.scss';
import { usePane } from '../App/App.js';
import { PANE } from '../Inspector.js';

export default function QueryInput(props: HTMLProps<HTMLInputElement>) {
  const [query] = useQuery();
  const [location, setLocation] = useLocation();
  const [, setPane] = usePane();

  const initialValue = query.join(', ');

  const [value, setValue] = useState(
    initialValue.startsWith(UNNAMED_PACKAGE) ? '' : initialValue,
  );
  let valueAsURL: URL | undefined = undefined;

  try {
    valueAsURL = new URL(value.trim());
  } catch (err) {
    // ignore
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!/^(?:Enter|Tab)$/.test(e.key)) return;

    let moduleKeys = (e.currentTarget as HTMLInputElement).value
      .split(',')
      .map(v => v.trim())
      .filter(isDefined);

    moduleKeys = [...new Set(moduleKeys)]; // De-dupe

    const url = new URLPlus(location);
    url.setSearchParam('q', moduleKeys.join(', '));
    url.hash = '';

    setLocation(url, false);
    setPane(PANE.GRAPH);
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
      {isGithubUrl(valueAsURL) ? (
        <div className="tip">
          Note: URLs that refer to private GitHub repos or gists should use the
          URL shown when{' '}
          <ExternalLink href="https://docs.github.com/en/enterprise-cloud@latest/repositories/working-with-files/using-files/viewing-a-file#viewing-or-copying-the-raw-file-content">
            viewing the "Raw" file
          </ExternalLink>
          .
        </div>
      ) : null}
      {valueAsURL ? (
        <div className="tip">
          Note: {valueAsURL.host} must allow CORS requests from the{' '}
          {location.host} domain for this to work
        </div>
      ) : null}
    </>
  );
}

function isGithubUrl(url?: URL) {
  if (!url) return false;
  return /^github.com$|\.github.com$/.test(url?.host ?? '');
}
