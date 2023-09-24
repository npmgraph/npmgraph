import filterAlteredClicks from 'filter-altered-clicks';
import React from 'react';
import { useQuery } from './App.js';

export function QueryLink({ query }: { query: string | string[] }) {
  const [, setQuery] = useQuery();
  const queries = Array.isArray(query) ? query : [query];

  function onClick(e: React.MouseEvent) {
    const target = e.target as HTMLAnchorElement;
    e.preventDefault();
    setQuery(queries);
    history.pushState(null, '', target.href);
  }

  const url = new URL(location.href);
  url.search = query.length ? `q=${queries.join(',')}` : '';

  return (
    <a href={url.href} onClick={filterAlteredClicks(onClick)}>
      {queries.join(',')}
    </a>
  );
}
