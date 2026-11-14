import { useEffect, useLayoutEffect, useRef } from 'react';
import { $ } from 'select-dom';

// Last scroll position per tab, valid only while the tab shows the same content
const positions = new Map<string, { key: string; top: number }>();

// Remember each tab's scroll position and restore it when coming back to it,
// but only if its content is the same: `key` identifies the content
export function useTabScroll(
  tab: string,
  key: string,
  isTightScreen: boolean,
  isEnabled: boolean,
) {
  const currentRef = useRef({ tab, key });

  useLayoutEffect(() => {
    if (!isEnabled) {
      return;
    }

    currentRef.current = { tab, key };
    const saved = positions.get(tab);
    // The page scrolls on tight screens, the inspector otherwise
    const scroller = isTightScreen ? document.documentElement : $('#inspector');
    scroller?.scrollTo({
      top: saved?.key === key ? saved.top : 0,
      behavior: 'instant',
    });
  }, [tab, key, isTightScreen, isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const scroller = isTightScreen ? document.documentElement : $('#inspector');
    // The page's scroll events fire on the document
    const target = isTightScreen ? document : scroller;
    const save = () => {
      positions.set(currentRef.current.tab, {
        key: currentRef.current.key,
        top: scroller?.scrollTop ?? 0,
      });
    };

    target?.addEventListener('scroll', save, { passive: true });
    return () => {
      target?.removeEventListener('scroll', save);
    };
  }, [isTightScreen, isEnabled]);
}
