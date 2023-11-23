import React, { useRef } from 'react';

import { cn } from '../../lib/dom.js';
import { GraphState } from '../GraphDiagram/graph_util.js';
import styles from './DiagnosticSection.module.scss';
import { Diagnostic } from './diagnostics/Diagnostic.js';

// Make this a hook with graph and diagnostic constraints?
function runDiagnostic<T extends object>(
  graph: GraphState,
  diagnostic: Diagnostic<T>,
) {
  const mapState = {} as T;
  for (const [, moduleInfo] of graph.moduleInfos) {
    diagnostic.map(graph, moduleInfo, mapState);
  }

  return diagnostic.reduce(graph, mapState);
}

export function DiagnosticSection<T extends object>({
  graph,
  diagnostic,
  type = 'info',
  ...props
}: {
  graph: GraphState;
  diagnostic: Diagnostic<T>;
  type?: 'info' | 'warn' | 'error';
} & React.HTMLAttributes<HTMLDetailsElement>) {
  const ref = useRef<HTMLDetailsElement>(null);

  let symbol: string | null = null;
  if (type === 'info') symbol = null;
  else if (type === 'warn') symbol = '\u{26a0}';
  else if (type === 'error') symbol = '\u{1f6ab}';

  const results = runDiagnostic(graph, diagnostic);
  if (!results) return null;
  const { summary, details } = results;

  return (
    <details className={cn(styles.root, styles[type])} {...props} ref={ref}>
      <summary className="bright-hover">
        <span className={styles.symbol}>{symbol}</span>
        {summary}
      </summary>
      <div className={styles.body}>{details}</div>
    </details>
  );
}
