import React, { HTMLProps } from 'react';
import { isDefined } from '../../lib/guards.js';
import { useQuery } from '../App.js';
import './QueryInput.scss';

export default function QueryInput(props: HTMLProps<HTMLInputElement>) {
  const [query, setQuery] = useQuery();

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!/^(?:Enter|Tab)$/.test(e.key)) return;

    const names = (e.currentTarget as HTMLInputElement).value
      .split(',')
      .map(v => v.trim())
      .filter(isDefined);
    const query = [...new Set(names)]; // De-dupe

    setQuery(query);
  }

  const ref = React.useRef<HTMLInputElement>(null);

  function handleFocus() {
    if (ref.current) {
      ref.current.value = query.join(', ');
    }
  }

  return (
    <input
      type="text"
      id="search-field"
      defaultValue={query}
      onFocus={handleFocus}
      ref={ref}
      onKeyDown={handleKeyDown}
      placeholder={'\u{1F50D} \xa0Enter module name'}
      autoFocus
      {...props}
    />
  );
}
