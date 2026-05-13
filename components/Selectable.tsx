import type { HTMLProps } from 'react';
import type { QueryType } from '../lib/ModuleCache.ts';
import useGraphSelection from '../lib/useGraphSelection.ts';

import { cn } from '../lib/dom.ts';
import * as styles from './Selectable.module.scss';
import * as utilities from './utilities.module.scss';

export function Selectable({
  type,
  value,
  label,
  className,
  ...props
}: {
  type?: QueryType;
  value: string;
  label?: string;
} & HTMLProps<HTMLSpanElement>) {
  const setGraphSelection = useGraphSelection()[2];
  const title = label || value;

  return (
    <span
      className={cn(styles.root, utilities.brightHover, className)}
      title={title}
      onClick={() => setGraphSelection(type, value)}
      {...props}
    >
      {title}
    </span>
  );
}
