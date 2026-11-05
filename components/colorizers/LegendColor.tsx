import type { HTMLProps } from 'react';
import { COLORIZE_COLORS } from '../../lib/constants.ts';

export function LegendColor({
  color,
  children,
  ...props
}: HTMLProps<HTMLDivElement>) {
  color = COLORIZE_COLORS[Number(color)] ?? color;

  return (
    <div {...props}>
      <span style={{ color, marginRight: '0.5rem' }}>{'\u{2B24}'}</span>
      {children}
    </div>
  );
}
