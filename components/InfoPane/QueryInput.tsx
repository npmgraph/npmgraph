import { type HTMLProps, useId, useRef, useState } from 'react';
import { PARAM_QUERY, SEARCH_FIELD_ID } from '../../lib/constants.ts';
import { isDefined } from '../../lib/guards.ts';
import { cn } from '../../lib/dom.ts';
import { getCachedModule, QueryType } from '../../lib/ModuleCache.ts';
import { searchSet } from '../../lib/url-util.ts';
import useGraph from '../../hooks/useGraph.ts';
import useGraphSelection from '../../hooks/useGraphSelection.ts';
import { patchLocation } from '../../hooks/useLocation.ts';
import { useQuery } from '../../hooks/useQuery.ts';
import * as styles from './QueryInput.module.scss';

// No better detection for this :(
const hasSoftKeyboard = 'ontouchstart' in document.documentElement;

export default function QueryInput({
  variant,
  className,
  ...props
}: HTMLProps<HTMLInputElement> & { variant?: 'header' | 'hero' }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const enterValueRef = useRef<string | null>(null);
  const [query] = useQuery();
  const graph = useGraph();
  const setGraphSelection = useGraphSelection()[2];
  const listId = useId();
  const isHeader = variant === 'header';
  const inputValue = query
    .filter(key => !getCachedModule(key)?.isLocal)
    .join(', ');

  const [valueState, setValueState] = useState({
    query,
    inputValue,
    value: inputValue,
  });
  if (valueState.query !== query || valueState.inputValue !== inputValue) {
    setValueState({ query, inputValue, value: inputValue });
  }

  const { value } = valueState;

  function getSearchParameters() {
    let moduleKeys = inputRef
      .current!.value.split(',')
      .map(v => v.trim())
      .filter(item => isDefined(item));

    moduleKeys = [...new Set(moduleKeys)]; // De-dupe
    return searchSet(PARAM_QUERY, moduleKeys.join(', '));
  }

  function handleSubmit(event?: React.SubmitEvent<HTMLFormElement>) {
    event?.preventDefault();
    enterValueRef.current = null;
    patchLocation({ search: getSearchParameters(), hash: '' }, false, {
      isInput: true,
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return;
    }

    // Add cmd-enter support to search in a new tab
    if (event.metaKey) {
      window.open(`/?${getSearchParameters()}`, '_blank');
      event.preventDefault();
      return;
    }

    enterValueRef.current = event.currentTarget.value;
  }

  // Safari uses the first Enter to dismiss the datalist instead of submitting the form.
  // If the form wasn't submitted and the value is unchanged (no option was picked), do it now.
  function handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || enterValueRef.current === null) {
      return;
    }

    const isUnchanged = enterValueRef.current === event.currentTarget.value;
    enterValueRef.current = null;
    if (isUnchanged) {
      handleSubmit();
    }
  }

  return (
    <form action="/" className={styles.form} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="search"
        name="q"
        aria-label="Search npm modules"
        id={SEARCH_FIELD_ID}
        className={cn(styles.input, variant && styles[variant], className)}
        placeholder="Search…"
        value={value}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        // Don't attempt to auto-focus on mobile, it doesn't actually work and when it works it's distracting.
        autoFocus={!hasSoftKeyboard && query.length === 0}
        list={isHeader ? listId : undefined}
        onChange={event => {
          const { value } = event.target;
          setValueState({ query, inputValue, value });
          if (!isHeader) {
            return;
          }

          // Until submitted, highlight the matches of the term being typed in the graph
          const filter =
            value.trim() === inputValue ? '' : value.split(',').at(-1)!.trim();
          setGraphSelection(
            filter ? QueryType.Search : QueryType.Default,
            filter,
          );
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        {...props}
      />
      {isHeader && (
        <datalist id={listId}>
          {[...graph.moduleInfos.values()].map(({ module }) => (
            <option key={module.key} value={module.label} />
          ))}
        </datalist>
      )}
    </form>
  );
}
