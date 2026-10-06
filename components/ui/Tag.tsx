import { type QueryTypeValue, QueryType } from '../../lib/ModuleCache.ts';
import type { HTMLProps } from 'react';
import { cn } from '../../lib/dom.ts';
import useGraphSelection from '../../hooks/useGraphSelection.ts';
import { Gravatar } from './Gravatar.tsx';
import * as styles from './Tag.module.scss';
import * as utilities from './utilities.module.scss';

export function Tags({
  children,
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  return (
    <div className={cn(styles.tags, className)} {...props}>
      {children}
    </div>
  );
}

export function Tag({
  type,
  value,
  count = 0,
  gravatar,
  className,
}: {
  type: QueryTypeValue;
  value: string;
  count?: number;
  gravatar?: string;
} & HTMLProps<HTMLDivElement>) {
  const setGraphSelection = useGraphSelection()[2];
  let title = value;
  if (count > 1) {
    title += ` (${count})`;
  }

  return (
    <div
      className={cn(
        styles.tag,
        type === QueryType.Maintainer ? styles.maintainer : '',
        utilities.brightHover,
        className,
      )}
      title={title}
      onClick={() => {
        setGraphSelection(type, value);
      }}
    >
      {gravatar && <Gravatar email={gravatar} username={value} />}
      {title}
    </div>
  );
}
