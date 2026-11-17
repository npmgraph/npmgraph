import { useEffect, useRef } from 'react';
import { closestElementOptional } from 'select-dom';
import * as styles from './Tooltip.module.css';

const ANCHOR_NAME = '--tooltip-anchor';
const HOVER_DELAY = 400; // ms, the tooltip fades in after this

// Links, buttons and images (not SVGs, like the logo) named by their `aria-label`
const TARGETS = ':is(a, button, [role="img"]):not(svg)[aria-label]';

// A single shared tooltip that shows the `aria-label` of the hovered or focused
// element. It's a popover (top layer, no clipping) positioned in CSS via anchor
// positioning.
export default function Tooltip() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tooltip = ref.current!;
    let target: HTMLElement | undefined;

    function hide() {
      target?.style.removeProperty('anchor-name');
      target = undefined;
      tooltip.hidePopover();
    }

    function show(element: HTMLElement, delay: number) {
      target = element;
      element.style.setProperty('anchor-name', ANCHOR_NAME);
      tooltip.textContent = element.getAttribute('aria-label');
      tooltip.style.setProperty('--tooltip-delay', `${delay}ms`);

      tooltip.showPopover();
    }

    function tooltipTarget(event: Event) {
      return closestElementOptional(TARGETS, event.target as Node | undefined);
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
  }, []);

  return (
    <div ref={ref} role="tooltip" popover="manual" className={styles.tooltip} />
  );
}
