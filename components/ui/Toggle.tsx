import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/dom.ts';
import * as styles from './Toggle.module.scss';

export function Toggle({
  checked = false,
  onChange,
  style,
  children,
  className,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  checked?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={cn(styles.toggle, { [styles.checked]: checked }, className)}
      style={style}
      {...props}
      onClick={onChange}
    >
      <span>
        <span>{checked ? 'On' : 'Off'}</span>
      </span>
      {children}
    </button>
  );
}
