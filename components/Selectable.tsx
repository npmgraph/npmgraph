import { HTMLProps } from 'react';
import { QueryType } from '../lib/ModuleCache.js';
import useGraphSelection from '../lib/useGraphSelection.js';

import { cn } from '../lib/dom.js';
import styles from './Selectable.module.scss';

export function Selectable({
  type,
  value,
  label,
  className,
  ...props
}: {
  type: QueryType;
  value: string;
  label?: string;
} & HTMLProps<HTMLSpanElement>) {
  const [, , setGraphSelection] = useGraphSelection();
  const title = label || value;

  return (
    <span
      className={cn(styles.root, 'selectable', 'bright-hover', className)}
      title={title}
      onClick={() => setGraphSelection(type, value)}
      {...props}
    >
      {title}
    </span>
  );
}
