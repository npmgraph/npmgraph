import React, { HTMLProps, useState } from 'react';
import { useGlobalState } from '../../lib/GlobalStore.js';
import { UNNAMED_PACKAGE } from '../../lib/constants.js';
import { isDefined } from '../../lib/guards.js';
import { searchSet } from '../../lib/url_util.js';
import { patchLocation } from '../../lib/useLocation.js';
import { useQuery } from '../../lib/useQuery.js';
import { ExternalLink } from '../ExternalLink.js';
import { PANE } from '../Inspector.js';
import './QueryInput.scss';

export default function QueryInput(props: HTMLProps<HTMLInputElement>) {
  const [query] = useQuery();
  const [, setPane] = useGlobalState('pane');

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
    if (e.key !== 'Enter' && e.key !== 'Tab') return;

    let moduleKeys = e.currentTarget.value
      .split(',')
      .map(v => v.trim())
      .filter(isDefined);

    moduleKeys = [...new Set(moduleKeys)]; // De-dupe

    patchLocation(
      {
        search: searchSet('q', moduleKeys.join(', ')),
        hash: '',
      },
      false,
    );

    setPane(PANE.GRAPH);
  }

  return (
    <>
      <input
        type="text"
        id="search-field"
        placeholder="Search…"
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
