import { useEffect } from 'react';
import { SEARCH_FIELD_ID } from '../lib/constants.ts';

function handleKeyPress(ev: KeyboardEvent) {
  const { nodeName } = ev.target as HTMLElement;
  // Focus search field with "/", unless typing in a field
  if (nodeName === 'INPUT' || nodeName === 'TEXTAREA' || ev.key !== '/') {
    return;
  }

  ev.preventDefault();
  document.getElementById(SEARCH_FIELD_ID)?.focus();
}

// Ad-hoc code for handling keyboard shortcuts. If/when we need something more sophisticated, we should consider using a library like `mousetrap`.
export function useKeyboardShortcuts() {
  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, []);
}
