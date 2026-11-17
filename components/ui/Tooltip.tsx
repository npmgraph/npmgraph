import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  useId,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import * as styles from './Tooltip.module.css';

const HOVER_DELAY = 400; // ms, the tooltip fades in after this
const IS_SUPPORTED = globalThis.CSS?.supports('position-area', 'bottom');

function showPopover(element: HTMLElement | null) {
  element?.showPopover();
}

type TooltipProps = {
  'aria-label': string;
  title?: string;
  style?: CSSProperties;
  onPointerEnter?: (event: PointerEvent) => void;
  onPointerLeave?: () => void;
  onPointerDown?: () => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
};

// Shows `label` as a tooltip when the element that gets the `props` is hovered
// or focused with the keyboard. The label is also its `aria-label`.
// It's a popover (top layer, no clipping) positioned in CSS via anchor
// positioning, otherwise it falls back to `title`.
export default function Tooltip({
  label,
  children,
}: {
  label: string;
  children: (props: TooltipProps) => ReactElement;
}) {
  const [trigger, setTrigger] = useState<'pointer' | 'focus'>();
  const anchorName = `--tooltip-${useId().replaceAll(/\W/gv, '')}`;

  function hide() {
    setTrigger(undefined);
  }

  if (!IS_SUPPORTED) {
    return children({ 'aria-label': label, title: label });
  }

  return (
    <>
      {children({
        'aria-label': label,
        style: trigger ? { anchorName } : undefined,
        onPointerEnter(event) {
          // Touch has no hover, the tap would only flash the tooltip
          if (event.pointerType !== 'touch') {
            setTrigger('pointer');
          }
        },
        onPointerLeave: hide,
        onPointerDown: hide,
        onFocus(event) {
          if (event.currentTarget.matches(':focus-visible')) {
            setTrigger('focus');
          }
        },
        onBlur: hide,
        onKeyDown(event) {
          if (event.key === 'Escape') {
            hide();
          }
        },
      })}
      {trigger &&
        createPortal(
          <div
            ref={showPopover}
            role="tooltip"
            popover="manual"
            className={styles.tooltip}
            style={{
              positionAnchor: anchorName,
              animationDelay: trigger === 'pointer' ? `${HOVER_DELAY}ms` : '0s',
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
}
