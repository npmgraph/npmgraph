import { cn } from '../lib/dom.ts';
import * as styles from './Button.module.scss';

type ButtonProps = { selected?: boolean } & (
  | React.JSX.IntrinsicElements['button']
  // `href` enables union discrimination
  | (React.JSX.IntrinsicElements['a'] & { href: string })
);

export function Button({
  selected,
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  props.className = cn(
    styles.button,
    selected && styles.selected,
    props.className,
  );

  return 'href' in props ? (
    <a {...props}>{children}</a>
  ) : (
    <button type="button" {...props}>
      {children}
    </button>
  );
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
  square,
  ...props
}: {
  vertical?: boolean;
  square?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        props.className,
        vertical ? styles.verticalGroup : styles.horizontalGroup,
        square && styles.square,
      )}
    />
  );
}
