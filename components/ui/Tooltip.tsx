import { useEffect, useId, useRef } from 'react';
import { closestElementOptional } from 'select-dom';
import * as styles from './Tooltip.module.css';

const ANCHOR_NAME = '--tooltip-anchor';
const HOVER_DELAY = 400; // ms, the tooltip fades in after this

// A single shared tooltip for every `[data-tooltip]` element. It's a popover
// (top layer, no clipping) positioned in CSS via anchor positioning.
export default function Tooltip() {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tooltip = ref.current!;
    let target: HTMLElement | undefined;

    function hide() {
      target?.style.removeProperty('anchor-name');
      target?.removeAttribute('aria-describedby');
      target = undefined;
      tooltip.hidePopover();
    }

    function show(element: HTMLElement, delay: number) {
      const text = element.dataset['tooltip'] ?? '';
      target = element;
      element.style.setProperty('anchor-name', ANCHOR_NAME);
      tooltip.textContent = text;
      tooltip.style.setProperty('--tooltip-delay', `${delay}ms`);

      // Don't describe an element by what already names it
      if (
        element.getAttribute('aria-label') !== text &&
        element.textContent.trim() !== text
      ) {
        element.setAttribute('aria-describedby', id);
      }

      tooltip.showPopover();
    }

    function tooltipTarget(event: Event) {
      return closestElementOptional(
        '[data-tooltip]',
        event.target as Node | undefined,
      );
    }

    function onPointerOver(event: PointerEvent) {
      const element = tooltipTarget(event);
      // Touch has no hover, the tap would only flash the tooltip
      if (element === target || event.pointerType === 'touch') {
        return;
      }

      hide();
      if (element) {
        show(element, HOVER_DELAY);
      }
    }

    // The pointer left the window
    function onPointerOut(event: PointerEvent) {
      if (!event.relatedTarget) {
        hide();
      }
    }

    function onFocusIn(event: FocusEvent) {
      const element = tooltipTarget(event);
      if (!element?.matches(':focus-visible')) {
        return;
      }

      hide();
      show(element, 0);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        hide();
      }
    }

    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', hide);
    document.addEventListener('pointerdown', hide);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('scroll', hide, { capture: true });

    return () => {
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', hide);
      document.removeEventListener('pointerdown', hide);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('scroll', hide, { capture: true });
    };
  }, [id]);

  return (
    <div
      ref={ref}
      id={id}
      role="tooltip"
      popover="manual"
      className={styles.tooltip}
    />
  );
}
