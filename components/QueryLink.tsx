import filterAlteredClicks from 'filter-altered-clicks';
import React, { type HTMLProps } from 'react';
import { useGlobalState } from '../lib/GlobalStore.js';
import { PARAM_QUERY } from '../lib/constants.js';
import { urlPatch } from '../lib/url_util.js';
import { patchLocation } from '../lib/useLocation.js';
import { PANE } from './Inspector.js';

export function QueryLink({
  query,
  reset = true,
  children,
  ...props
}: HTMLProps<HTMLAnchorElement> & {
  reset?: boolean;
  query: string | string[];
}) {
  const [, setPane] = useGlobalState('pane');

  const queries = Array.isArray(query) ? query : [query];

  const search = query.length ? `${PARAM_QUERY}=${queries.join(',')}` : '';
  const hash = reset ? '' : location.hash;
  const url = urlPatch({ search, hash });

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    setPane(PANE.GRAPH);
    patchLocation({ search, hash }, false);
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
