/**
 * Analyzers are used to analyze a graph and both a summary and details of the
 * analysis.  The operation here is based on the map/reduce pattern.  The map
 * function is called for each module in the graph and the reduce function is
 * called once after all modules have been processed
 *
 * The "mapState" is initialized by the calling logic (in AnalyzerItem) to an
 * empty object. Each analyzer is responsible for defining the type of the the
 * mapState, and for initializing the defined properties therein.
 */

import { GraphModuleInfo, GraphState } from '../../GraphDiagram/graph_util.js';

interface AnalyzerResult {
  summary: string;
  details: JSX.Element[];
}

export interface Analyzer<MapState extends object> {
  map(graph: GraphState, moduleInfo: GraphModuleInfo, mapState: MapState): void;
  reduce(graph: GraphState, mapState: MapState): AnalyzerResult | undefined;
}
