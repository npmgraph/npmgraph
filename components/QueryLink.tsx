import filterAlteredClicks from 'filter-altered-clicks';
import type { HTMLProps } from 'react';
import { PARAM_QUERY } from '../lib/constants.ts';
import { urlPatch } from '../lib/url_util.ts';
import { patchLocation } from '../lib/useLocation.ts';

export function QueryLink({
  query,
  reset = true,
  children,
  ...props
}: HTMLProps<HTMLAnchorElement> & {
  reset?: boolean;
  query: string | string[];
}) {
  const queries = Array.isArray(query) ? query : [query];

  const search = query.length ? `${PARAM_QUERY}=${queries.join(',')}` : '';
  const hash = reset ? '' : location.hash;
  const url = urlPatch({ search, hash });

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    patchLocation({ search, hash }, false);
  }

  if (!children) {
    return (
      <a href={url.href} onClick={filterAlteredClicks(onClick)} {...props}>
        {queries.join(', ')}
      </a>
    );
  }

  return (
    <a href={url.href} onClick={filterAlteredClicks(onClick)} {...props}>
      {children}
    </a>
  );
}
