import { createContext } from 'react';

/*
How report items are laid out: collapsible sections inside the inspector, or
always-open sections with linkable headings when only the report is shown.
*/
export const ReportLayoutContext = createContext<'collapsible' | 'document'>(
  'collapsible',
);

export function getHeadingId(title: string) {
  return title
    .toLowerCase()
    .replaceAll(/[^\s\p{Letter}\p{Number}\-]/gv, '')
    .trim()
    .replaceAll(/\s+/gv, '-');
}
