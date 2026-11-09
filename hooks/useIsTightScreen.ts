import { useSyncExternalStore } from 'react';
import { TIGHT_SCREEN_QUERY } from '../lib/constants.ts';

function subscribe(onChange: () => void) {
  const media = globalThis.matchMedia(TIGHT_SCREEN_QUERY);
  media.addEventListener('change', onChange);
  return () => {
    media.removeEventListener('change', onChange);
  };
}

function isScreenTight() {
  return globalThis.matchMedia(TIGHT_SCREEN_QUERY).matches;
}

export function useIsTightScreen() {
  const isTightScreen = useSyncExternalStore(subscribe, isScreenTight);
  return isTightScreen;
}
