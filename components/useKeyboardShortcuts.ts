import { useEffect } from 'react';
import { SEARCH_FIELD_ID } from '../lib/constants.ts';

// Ad-hoc code for handling keyboard shortcuts. If/when we need something more sophisticated, we should consider using a library like `mousetrap`.
export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyPress(ev: KeyboardEvent) {
      const { nodeName } = ev.target as HTMLElement;
      if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') return;

      // Focus search field with "/"
      if (ev.key === '/') {
        ev.preventDefault();
        document.getElementById(SEARCH_FIELD_ID)?.focus();
      }
    }

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, []);
}
