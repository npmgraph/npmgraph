import React, { useRef } from 'react';

import { cn } from '../../lib/dom.js';
import { GraphState } from '../GraphDiagram/graph_util.js';
import styles from './AnalyzerItem.module.scss';
import { Analyzer } from './analyzers/Analyzer.js';

// Make this a hook with graph and analyzer constraints?
function runAnalyzer<T extends object>(
  graph: GraphState,
  analyzer: Analyzer<T>,
) {
  const mapState = {} as T;
  for (const [, moduleInfo] of graph.moduleInfos) {
    analyzer.map(graph, moduleInfo, mapState);
  }

  return analyzer.reduce(graph, mapState);
}

export function AnalyzerSection<T extends object>({
  graph,
  analyzer,
  type = 'info',
  ...props
}: {
  graph: GraphState;
  analyzer: Analyzer<T>;
  type?: 'info' | 'warn' | 'error';
} & React.HTMLAttributes<HTMLDetailsElement>) {
  const ref = useRef<HTMLDetailsElement>(null);

  let symbol: string | null = null;
  if (type === 'info') symbol = null;
  else if (type === 'warn') symbol = '\u{26a0}';
  else if (type === 'error') symbol = '\u{1f6ab}';

  const results = runAnalyzer(graph, analyzer);
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
