import filterAlteredClicks from 'filter-altered-clicks';
import type { HTMLProps } from 'react';
import { PARAM_QUERY } from '../../lib/constants.ts';
import { urlPatch } from '../../lib/url-util.ts';
import { patchLocation } from '../../hooks/useLocation.ts';

export function QueryLink({
  query,
  reset = true,
  component: Component = 'a',
  children,
  ...props
}: HTMLProps<HTMLAnchorElement> & {
  reset?: boolean;
  query: string | string[];
  component?: React.ElementType;
}) {
  const queries = Array.isArray(query) ? query : [query];

  const search = query.length > 0 ? `${PARAM_QUERY}=${queries.join(',')}` : '';
  const hash = reset ? '' : location.hash;
  const url = urlPatch({ search, hash });

  function onClick(event: React.MouseEvent) {
    event.preventDefault();
    patchLocation({ search, hash }, false, { isInput: true });
  }

  if (!children) {
    return (
      <Component
        href={url.href}
        onClick={filterAlteredClicks(onClick)}
        {...props}
      >
        {queries.join(', ')}
      </Component>
    );
  }

  return (
    <Component
      href={url.href}
      onClick={filterAlteredClicks(onClick)}
      {...props}
    >
      {children}
    </Component>
  );
}
