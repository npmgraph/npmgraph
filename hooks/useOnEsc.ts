import { useEffect } from 'react';

const EDITABLE = 'input, textarea, select, [contenteditable]';

/**
Call `handler` when Esc is pressed (ignored while typing in form fields).
*/
export default function useOnEsc(handler: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) {
        return;
      }
      if (
        event.target instanceof HTMLElement &&
        event.target.matches(EDITABLE)
      ) {
        return;
      }
      handler();
    };

    globalThis.addEventListener('keydown', onKeyDown);
    return () => {
      globalThis.removeEventListener('keydown', onKeyDown);
    };
  }, [handler]);
}
