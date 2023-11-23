import { GraphModuleInfo, GraphState } from '../../GraphDiagram/graph_util.js';

interface AnalyzerResult {
  summary: string;
  details: JSX.Element[];
}

export interface Analyzer<T extends object> {
  map(graph: GraphState, moduleInfo: GraphModuleInfo, mapState: T): void;
  reduce(graph: GraphState, mapState: T): AnalyzerResult | undefined;
}
