import { GraphModuleInfo, GraphState } from '../../GraphDiagram/graph_util.js';

interface DiagnosticResult {
  summary: string;
  details: JSX.Element[];
}

export interface Diagnostic<T extends object> {
  map(graph: GraphState, moduleInfo: GraphModuleInfo, mapState: T): void;
  reduce(graph: GraphState, mapState: T): DiagnosticResult | undefined;
}
