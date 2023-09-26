import filterAlteredClicks from 'filter-altered-clicks';
import React from 'react';
import useLocation from '../lib/useLocation.js';
import { useQuery } from './App.js';

export function QueryLink({ query }: { query: string | string[] }) {
  const [, setQuery] = useQuery();
  const [location] = useLocation();

  const queries = Array.isArray(query) ? query : [query];

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    setQuery(queries);
  }

  const url = new URL(location);
  url.search = query.length ? `q=${queries.join(',')}` : '';

  return (
    <a href={url.href} onClick={filterAlteredClicks(onClick)}>
      {queries.join(',')}
    </a>
  );
}
