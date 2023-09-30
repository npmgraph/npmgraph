import filterAlteredClicks from 'filter-altered-clicks';
import React, { HTMLProps } from 'react';
import { PARAM_QUERY } from '../lib/constants.js';
import useLocation from '../lib/useLocation.js';

export function QueryLink({
  query,
  children,
  ...props
}: HTMLProps<HTMLAnchorElement> & {
  query: string | string[];
}) {
  const [location, setLocation] = useLocation();

  const queries = Array.isArray(query) ? query : [query];

  const url = new URL(location);
  url.search = query.length ? `${PARAM_QUERY}=${queries.join(',')}` : '';
  url.hash = '';

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    setLocation(url, false);
  }

  if (!children) {
    return (
      <a href={url.href} onClick={filterAlteredClicks(onClick)} {...props}>
        {queries.join(',')}
      </a>
    );
  }

  return (
    <a href={url.href} onClick={filterAlteredClicks(onClick)} {...props}>
      {children}
    </a>
  );
}
