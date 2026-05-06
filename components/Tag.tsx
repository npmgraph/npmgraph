import md5 from 'md5';
import type { HTMLProps } from 'react';
import * as indexStyles from '../index.module.scss';
import type { QueryType } from '../lib/ModuleCache.ts';
import { cn } from '../lib/dom.ts';
import useGraphSelection from '../lib/useGraphSelection.ts';

export function Tag({
  type,
  value,
  count = 0,
  gravatar,
  className,
}: {
  type: QueryType;
  value: string;
  count?: number;
  gravatar?: string;
} & HTMLProps<HTMLDivElement>) {
  const [, , setGraphSelection] = useGraphSelection();
  let title = value;
  if (count > 1) title += ` (${count})`;

  let img = null;
  if (gravatar) {
    const hash = md5(gravatar);
    img = <img src={`https://www.gravatar.com/avatar/${hash}?s=32`} />;
  }

  return (
    <div
      className={cn('tag', type, indexStyles.brightHover, className)}
      title={title}
      onClick={() => setGraphSelection(type, value)}
    >
      {img}
      {title}
    </div>
  );
}
