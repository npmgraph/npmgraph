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
  // The offset to restore once the content is tall enough to reach it
  const pendingRef = useRef<number>(null);

  useLayoutEffect(() => {
    if (isEnabled) {
      currentRef.current = { tab, key };
    }

    const saved = positions.get(tab);
    const top = saved?.key === key ? saved.top : 0;
    const scroller = isEnabled ? getScroller(isTightScreen) : null;
    const hasRestored = () => {
      scroller?.scrollTo({ top, behavior: 'instant' });
      // Content that loads later (e.g. an open section) may be too short at first, clamping the offset
      const isClamped = (scroller?.scrollTop ?? 0) < top - 1;
      pendingRef.current = isClamped ? top : null;
      return !isClamped;
    };

    // Keep trying as the content grows, until the user takes over
    const observer = new MutationObserver(() => {
      if (hasRestored()) {
        observer.disconnect();
      }
    });
    const abortController = new AbortController();
    const stop = () => {
      pendingRef.current = null;
      observer.disconnect();
    };

    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    if (scroller && !hasRestored()) {
      observer.observe(isTightScreen ? document.body : scroller, {
        subtree: true,
        childList: true,
        attributeFilter: ['open'],
      });
      for (const event of events) {
        globalThis.addEventListener(event, stop, {
          once: true,
          passive: true,
          signal: abortController.signal,
        });
      }
    }

    return () => {
      stop();
      abortController.abort();
    };
  }, [tab, key, isTightScreen, isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const scroller = getScroller(isTightScreen);
    // The page's scroll events fire on the document
    const target = isTightScreen ? document : scroller;
    const save = () => {
      // The offset is still being restored, so the current one is a clamped intermediate
      if (pendingRef.current !== null) {
        return;
      }

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
