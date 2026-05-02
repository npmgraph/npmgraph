import { useEffect } from 'react';
import { PARAM_HIDE } from '../lib/constants.ts';
import useHashParam from '../lib/useHashParam.ts';

// Ad-hoc code for handling keyboard shortcuts. If/when we need something more sophisticated, we should consider using a library like `mousetrap`.
export function useKeyboardShortcuts() {
  const [, setHide] = useHashParam(PARAM_HIDE);

  useEffect(() => {
    function handleKeyPress(ev: KeyboardEvent) {
      const { nodeName } = ev.target as HTMLElement;
      if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') return;

      // Focus search field with "/"
      if (ev.key === '/') {
        setHide(false);
        ev.preventDefault();
        document.getElementById('search-field')?.focus();
      }
    }

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [setHide]);
}
