import type { HTMLProps } from 'react';
import { useRef, useState } from 'react';
import {
  PANE,
  PARAM_QUERY,
  SEARCH_FIELD_ID,
  UNNAMED_PACKAGE,
} from '../../lib/constants.ts';
import { isDefined } from '../../lib/guards.ts';
import { cn } from '../../lib/dom.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { searchSet } from '../../lib/url_util.ts';
import { patchLocation } from '../../lib/useLocation.ts';
import { useQuery } from '../../lib/useQuery.ts';
import * as styles from './QueryInput.module.scss';

// No better detection for this :(
const hasSoftKeyboard = 'ontouchstart' in document.documentElement;

export default function QueryInput({
  className,
  ...props
}: HTMLProps<HTMLInputElement>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query] = useQuery();
  const [graph] = useGlobalState('graph');
  const [, setPane] = useGlobalState('pane');
  const initialValue = query.join(', ');

  const [value, setValue] = useState(
    initialValue.startsWith(UNNAMED_PACKAGE) ? '' : initialValue,
  );

  function getSearchParams() {
    let moduleKeys = inputRef
      .current!.value.split(',')
      .map(v => v.trim())
      .filter(isDefined);

    moduleKeys = [...new Set(moduleKeys)]; // De-dupe
    return searchSet(PARAM_QUERY, moduleKeys.join(', '));
  }

  function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();

    patchLocation({ search: getSearchParams(), hash: '' }, false);
  }

  // Add cmd-enter support to search in a new tab
  function handleCmdEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && e.metaKey) {
      window.open(`/?${getSearchParams()}`, '_blank');
      e.preventDefault();
    }
  }

  function handleFocus() {
    setPane(PANE.INFO);
  }

  const errors = [...graph.failedEntryModules.entries()].filter(([key]) =>
    query.includes(key),
  );

  return (
    <>
      <form action="/" onSubmit={handleSubmit}>
        <input
          type="search"
          name="q"
          ref={inputRef}
          id={SEARCH_FIELD_ID}
          className={cn(styles.input, className)}
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
          onFocus={handleFocus}
          {...props}
        />
      </form>

      {errors.map(([key, error]) => (
        <div key={key} className={styles.queryError}>
          {error.message}
        </div>
      ))}
    </>
  );
}
