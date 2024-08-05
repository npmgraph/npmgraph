import type { HTMLProps } from 'react';
import { cn } from '../lib/dom.js';

import styles from './Section.module.scss';

export function Section({
  title,
  className,
  children,
  open = true,
  ...props
}: { title: string; open?: boolean } & HTMLProps<HTMLDetailsElement>) {
  return (
    <>
      <hr />
      <details open={open} {...props} className={cn(className, styles.root)}>
        <summary>
          <span>{title || 'Untitled'}</span>
        </summary>
        {children}
      </details>
    </>
  );
}
