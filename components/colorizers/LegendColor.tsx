import type { HTMLProps } from 'react';
import { COLORIZE_COLORS } from '../../lib/constants.ts';
import * as styles from './LegendColor.module.css';

const largeCircle = '\u{2B24}';

export function LegendColor({
  color,
  children,
  ...props
}: HTMLProps<HTMLDivElement>) {
  color = COLORIZE_COLORS[Number(color)] ?? color;

  return (
    <div {...props}>
      <span className={styles.dot} style={{ color }}>
        {largeCircle}
      </span>
      {children}
    </div>
  );
}
