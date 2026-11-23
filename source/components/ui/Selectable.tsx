import type { ButtonHTMLAttributes } from 'react';
import { useSelect } from '../../hooks/useSelect.ts';
import { cn } from '../../lib/dom.ts';
import { QueryType, type QueryTypeValue } from '../../lib/ModuleCache.ts';
import * as styles from './Selectable.module.scss';
import * as utilities from './utilities.module.css';

export function Selectable({
  type = QueryType.Default,
  value,
  label = value,
  className,
  ...props
}: {
  type?: QueryTypeValue;
  value: string;
  label?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>) {
  const select = useSelect();
  return (
    <button
      type="button"
      className={cn(styles.root, utilities.brightHover, className)}
      onClick={() => {
        select(type, value);
      }}
      {...props}
    >
      {label}
    </button>
  );
}
