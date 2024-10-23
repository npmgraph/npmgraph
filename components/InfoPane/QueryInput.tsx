import React, { type HTMLProps, useRef, useState } from 'react';
import { UNNAMED_PACKAGE } from '../../lib/constants.js';
import { isDefined } from '../../lib/guards.js';
import { searchSet } from '../../lib/url_util.js';
import { patchLocation } from '../../lib/useLocation.js';
import { useQuery } from '../../lib/useQuery.js';
import { ExternalLink } from '../ExternalLink.js';
import './QueryInput.scss';

// No better detection for this :(
const hasSoftKeyboard = 'ontouchstart' in document.documentElement;

export default function QueryInput(props: HTMLProps<HTMLInputElement>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query] = useQuery();
  const initialValue = query.join(', ');

  const [value, setValue] = useState(
    initialValue.startsWith(UNNAMED_PACKAGE) ? '' : initialValue,
  );
  let valueAsURL: URL | undefined;

  try {
    valueAsURL = new URL(value.trim());
  } catch {
    // ignore
  }

  function getSearchParams() {
    let moduleKeys = inputRef
      .current!.value.split(',').map(v => v.trim()).filter(isDefined);

    moduleKeys = [...new Set(moduleKeys)]; // De-dupe
    return searchSet('q', moduleKeys.join(', '));
  }

  function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();

    patchLocation(
      {
        search: getSearchParams(),
        hash: '',
      },
      false,
    );
  }

  // Add cmd-enter support to search in a new tab
  function handleCmdEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && e.metaKey) {
      window.open(`/?${getSearchParams()}`, '_blank');
      e.preventDefault();
    }
  }

  return (
    <>
      <form action="/" onSubmit={handleSubmit}>
        <input
          type="search"
          name="q"
          ref={inputRef}
          id="search-field"
          placeholder="Search…"
          value={value}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          // Don't attempt to auto-focus on mobile, it doesn't actually work and when it works it's distracting
          autoFocus={!hasSoftKeyboard}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleCmdEnter}
          {...props}
        />
      </form>

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
