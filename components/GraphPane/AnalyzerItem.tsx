import React from 'react';

import { report } from '../../lib/bugsnag.js';
import { cn } from '../../lib/dom.js';
import { GraphState } from '../GraphDiagram/graph_util.js';
import styles from './AnalyzerItem.module.scss';
import { Analyzer } from './analyzers/Analyzer.js';

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

export function AnalyzerItem<T extends object>({
  graph,
  analyzer,
  type = 'info',
  children,
  ...props
}: {
  graph: GraphState;
  analyzer: Analyzer<T>;
  type?: 'info' | 'warn' | 'error';
} & React.HTMLAttributes<HTMLDetailsElement>) {
  let symbol: string | null = null;
  if (type === 'info') symbol = null;
  else if (type === 'warn') symbol = '\u{26a0}';
  else if (type === 'error') symbol = '\u{1f6ab}';

  let results;
  try {
    results = runAnalyzer(graph, analyzer);
  } catch (err) {
    report.error(err as Error);
    return;
  }

  if (!results) return;
  const { summary, details } = results;

  return (
    <details className={cn(styles.root, styles[type])} {...props}>
      <summary className="bright-hover">
        <span className={styles.symbol}>{symbol}</span>
        {summary}
      </summary>
      {children ? <div className={styles.description}>{children}</div> : null}
      <div className={styles.body}>{details}</div>
    </details>
  );
}
