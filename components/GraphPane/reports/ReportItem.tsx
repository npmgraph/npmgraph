import { useEffect, useState } from 'react';

import * as indexStyles from '../../../index.module.scss';
import { cn } from '../../../lib/dom.ts';
import type { RenderedAnalysis } from './Analyzer.tsx';
import * as styles from './ReportItem.module.scss';

const SYMBOLS = { info: null, warn: '\u{26A0}', error: '\u{1F6AB}' };

export function ReportItem<T>({
  data,
  reporter,
  children,
  ...props
}: {
  data?: T;
  reporter: (
    state: T,
  ) => Promise<RenderedAnalysis | undefined> | RenderedAnalysis | undefined;
  type?: 'info' | 'warn' | 'error';
} & React.HTMLAttributes<HTMLDetailsElement>) {
  const [analysis, setAnalysis] = useState<RenderedAnalysis>();

  useEffect(() => {
    if (!data) return;

    Promise.resolve(reporter(data)).then(report => {
      setAnalysis(report);
    });
  }, [data, reporter]);

  if (!analysis) return null;

  const { type, summary, details } = analysis;

  return (
    <details className={cn(styles.root, styles[type])} {...props}>
      <summary className={indexStyles.brightHover}>
        <span className={styles.symbol}>{SYMBOLS[type]}</span>
        {summary}
      </summary>
      {children ? <div className={styles.description}>{children}</div> : null}
      <div className={styles.root}>{details}</div>
    </details>
  );
}
