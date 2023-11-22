import React, { useRef } from 'react';

import $ from '../../lib/dom.js';
import styles from './Diagnostic.module.scss';

export function Diagnostic({
  message,
  type,
  children,
  ...props
}: {
  message: string;
  type?: 'warn' | 'error';
} & React.HTMLAttributes<HTMLDetailsElement>) {
  const ref = useRef<HTMLDetailsElement>(null);

  function handleDetailClick(event: React.MouseEvent<HTMLDetailsElement>) {
    // Ignore clicks outside of the summary element
    if (!(event.target as HTMLElement).closest('summary')) return;

    event.preventDefault();

    const detailsEls = $<HTMLDetailsElement>('#inspector details');
    for (const details of detailsEls) {
      if (ref.current && details === ref.current) {
        details.open = !details.open;
      } else {
        details.open = false;
      }
    }
  }

  let symbol = ' ';
  if (type === 'warn') {
    symbol = '\u{26a0}';
  } else if (type === 'error') {
    symbol = '\u{1f6ab}';
  }
  return (
    <details
      className={styles.root}
      {...props}
      onClick={handleDetailClick}
      ref={ref}
    >
      <summary className="bright-hover">
        <span>{symbol}</span>
        {message}
      </summary>
      {children}
    </details>
  );
}
