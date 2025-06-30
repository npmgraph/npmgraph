/**
 * Graph analysis is implemented in two parts:
 *
 *   - Analyzers - functions that inspect the graph and generate state for use
 *     in Renderers (below)
 *   - Renderers - functions that take Analyzer state and render user-facing
 *     markup
 *
 * Note: These two constructs are kept distinct from one another so an analyzer
 * can generate state that is used by more than one renderer
 */

import type { ReactElement } from 'react';
import type {
  GraphModuleInfo,
  GraphState,
} from '../../GraphDiagram/graph_util.js';

export type Analyzer2 = (graph: GraphState) => unknown;

export type RenderedAnalysis =
  | {
      type: 'info' | 'warn' | 'error';
      summary: string;
      details: ReactElement[];
    }
  | undefined;

export abstract class Analyzer {
  constructor(public graph: GraphState) {}
  abstract map(moduleInfo: GraphModuleInfo): void;
  abstract reduce(): RenderedAnalysis | undefined;
}
