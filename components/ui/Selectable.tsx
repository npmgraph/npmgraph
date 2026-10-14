import type { ButtonHTMLAttributes } from 'react';
import type { QueryTypeValue } from '../../lib/ModuleCache.ts';
import useGraphSelection from '../../hooks/useGraphSelection.ts';

import { cn } from '../../lib/dom.ts';
import * as styles from './Selectable.module.scss';
import * as utilities from './utilities.module.scss';

export function Selectable({
  type,
  value,
  label = value,
  className,
  ...props
}: {
  type?: QueryTypeValue;
  value: string;
  label?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>) {
  const setGraphSelection = useGraphSelection()[2];
  return (
    <button
      type="button"
      className={cn(styles.root, utilities.brightHover, className)}
      title={label}
      onClick={() => {
        setGraphSelection(type, value);
      }}
      {...props}
    >
      {label}
    </button>
  );
}
