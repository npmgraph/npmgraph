import { cn } from '../lib/dom.ts';
import * as styles from './Button.module.scss';

export function Button({
  selected,
  children,
  ...props
}: {
  selected?: boolean;
} & (
  React.JSX.IntrinsicElements['a'] | React.JSX.IntrinsicElements['button']
)): React.JSX.Element {
  props.className = cn(
    styles.button,
    selected && styles.selected,
    props.className,
  );
  return 'href' in props && typeof props.href === 'string' ? (
    <a {...props}>{children}</a>
  ) : (
    // @ts-expect-error This is for Claude to fix
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export function ButtonBadge({ children }: { children: React.ReactNode }) {
  return <span className={styles.badge}>{children}</span>;
}

export function ButtonCheckbox({
  children,
  ...props
}: Omit<React.JSX.IntrinsicElements['input'], 'type'>): React.JSX.Element {
  return (
    <label className={cn(styles.button, styles.checkbox)}>
      <input type="checkbox" {...props} />
      {children}
    </label>
  );
}

export function ButtonGroup({
  vertical,
  ...props
}: { vertical?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        props.className,
        vertical ? styles.verticalGroup : styles.horizontalGroup,
      )}
    />
  );
}
