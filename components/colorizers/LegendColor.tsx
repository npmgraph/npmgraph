import type { HTMLProps } from 'react';
import { colors } from './colors.ts';
import * as styles from './LegendColor.module.css';

export function LegendColor({
  color,
  children,
  ...props
}: Omit<HTMLProps<HTMLDivElement>, 'color'> & {
  color: keyof typeof colors;
}) {
  return (
    <div {...props}>
      <svg className={styles.dot} viewBox="0 0 1 1" aria-hidden="true">
        <circle cx="0.5" cy="0.5" r="0.5" fill={colors[color]} />
      </svg>
      {children}
    </div>
  );
}
