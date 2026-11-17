import type { HTMLProps } from 'react';
import { COLORIZE_COLORS } from '../../lib/constants.ts';
import * as styles from './LegendColor.module.css';

export function LegendColor({
  color,
  children,
  ...props
}: HTMLProps<HTMLDivElement>) {
  color = COLORIZE_COLORS[Number(color)] ?? color;

  return (
    <div {...props}>
      <span className={styles.dot} style={{ color }}>
        {'\u{2B24}'}
      </span>
      {children}
    </div>
  );
}
