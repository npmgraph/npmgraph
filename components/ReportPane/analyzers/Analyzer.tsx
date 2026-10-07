/**
 Graph analysis is implemented in two parts:
 
 - Analyzers - functions that inspect the graph and generate state for use
 in Renderers (below)
 - Renderers - functions that take Analyzer state and render user-facing
 markup
 
 Note: These two constructs are kept distinct from one another so an analyzer
 can generate state that is used by more than one renderer
 */

import type { ReactElement } from 'react';

export type RenderedAnalysis = {
  type: 'info' | 'warn' | 'error';
  summary: string;
  count?: number | string;
  details: ReactElement[];
};
