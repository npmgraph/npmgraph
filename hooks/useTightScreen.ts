import { useSyncExternalStore } from 'react';
import { PaneType, TIGHT_SCREEN_QUERY } from '../lib/constants.ts';
import { getGlobalState, setGlobalState } from '../lib/GlobalStore.ts';

function subscribe(onChange: () => void) {
  const media = globalThis.matchMedia(TIGHT_SCREEN_QUERY);
  const update = () => {
    onChange();
    if (!media.matches && getGlobalState('pane') === PaneType.GRAPH) {
      setGlobalState('pane', PaneType.REPORT);
    }
  };

  media.addEventListener('change', update);
  return () => {
    media.removeEventListener('change', update);
  };
}

function isScreenTight() {
  return globalThis.matchMedia(TIGHT_SCREEN_QUERY).matches;
}

export function useTightScreen() {
  const isTightScreen = useSyncExternalStore(subscribe, isScreenTight);
  return isTightScreen;
}
