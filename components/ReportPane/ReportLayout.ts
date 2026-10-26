import { createContext } from 'react';

/*
How report items are laid out. In the app they're collapsible sections; in a
standalone document they're always-open sections with linkable headings.
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
