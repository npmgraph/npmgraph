import type { HTMLProps } from 'react';
import { COLORS, type ColorName } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import * as styles from './LegendColor.module.css';

const largeCircle = '\u{2B24}';

export function LegendColor({
  color,
  children,
  ...props
}: Omit<HTMLProps<HTMLDivElement>, 'color'> & { color: ColorName }) {
  return (
    <div {...props}>
      <span className={cn(styles.dot, COLORS[color])}>{largeCircle}</span>
      {children}
    </div>
  );
}
