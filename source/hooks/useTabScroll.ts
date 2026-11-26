import { useEffect, useLayoutEffect, useRef } from 'react';
import { getScroller } from '../lib/dom.ts';

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
    getScroller(isTightScreen)?.scrollTo({
      top: saved?.key === key ? saved.top : 0,
      behavior: 'instant',
    });
  }, [tab, key, isTightScreen, isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const scroller = getScroller(isTightScreen);
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
