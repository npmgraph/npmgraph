import { useEffect, useState } from 'react';
import { PaneType } from './constants.ts';
import { getGlobalState, setGlobalState } from './GlobalStore.ts';

export const TIGHT_SCREEN_QUERY = '(max-aspect-ratio: 2/3), (max-width: 700px)';

export function useTightScreen() {
  const [isTightScreen, setIsTightScreen] = useState(
    () => globalThis.matchMedia(TIGHT_SCREEN_QUERY).matches,
  );

  useEffect(() => {
    const media = globalThis.matchMedia(TIGHT_SCREEN_QUERY);
    const update = () => {
      setIsTightScreen(media.matches);
      if (!media.matches && getGlobalState('pane') === PaneType.GRAPH) {
        setGlobalState('pane', PaneType.REPORT);
      }
    };
    media.addEventListener('change', update);
    return () => {
      media.removeEventListener('change', update);
    };
  }, []);

  return isTightScreen;
}
