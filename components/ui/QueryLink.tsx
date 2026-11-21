import filterAlteredClicks from 'filter-altered-clicks';
import type { HTMLProps } from 'react';
import { useHashParameters } from '../../hooks/useHashParam.ts';
import { patchLocation } from '../../hooks/useLocation.ts';
import { PARAM_QUERY } from '../../lib/constants.ts';
import { getViewSettings, urlPatch } from '../../lib/url-util.ts';

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
  const [hashParameters] = useHashParameters();
  const queries = Array.isArray(query) ? query : [query];

  const search = query.length > 0 ? `${PARAM_QUERY}=${queries.join(',')}` : '';
  const hash = (
    reset ? getViewSettings(hashParameters) : hashParameters
  ).toString();
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
