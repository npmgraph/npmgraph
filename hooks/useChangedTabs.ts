import { useState } from 'react';
import {
  PARAM_COLLAPSE,
  PARAM_COLORIZE,
  PARAM_DEPENDENCIES,
  PARAM_SELECTION,
  PARAM_SIZING,
} from '../lib/constants.ts';
import { useHashParameters } from './useHashParam.ts';
import { useQuery } from './useQuery.ts';

// The hash parameters that change what a tab shows. The query always does.
const watched: Record<string, string[]> = {
  graph: [
    PARAM_COLLAPSE,
    PARAM_COLORIZE,
    PARAM_DEPENDENCIES,
    PARAM_SELECTION,
    PARAM_SIZING,
  ],
  module: [PARAM_COLLAPSE, PARAM_COLORIZE, PARAM_DEPENDENCIES, PARAM_SELECTION],
  report: [PARAM_COLLAPSE, PARAM_DEPENDENCIES],
};

// The tabs whose content changed since the user last saw them
export function useChangedTabs(visibleTab: string | undefined) {
  const [parameters] = useHashParameters();
  const [query] = useQuery();
  const current = Object.fromEntries(
    Object.entries(watched).map(([id, names]) => [
      id,
      JSON.stringify([query, ...names.map(name => parameters.get(name))]),
    ]),
  );
  const [seen, setSeen] = useState(current);

  // Whatever is on screen is seen
  const visible = visibleTab ? current[visibleTab] : undefined;
  if (visibleTab && visible !== undefined && seen[visibleTab] !== visible) {
    setSeen(previous => ({ ...previous, [visibleTab]: visible }));
  }

  return new Set(
    Object.keys(watched).filter(
      id => id !== visibleTab && seen[id] !== current[id],
    ),
  );
}
