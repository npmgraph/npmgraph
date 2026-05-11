import { useEffect, useState } from 'react';

export const TIGHT_SCREEN_QUERY = '(max-aspect-ratio: 2/3), (max-width: 700px)';

function getMatches() {
  if (globalThis.window === undefined) return false;
  return globalThis.matchMedia(TIGHT_SCREEN_QUERY).matches;
}

export function useTightScreen() {
  const [isTightScreen, setIsTightScreen] = useState(getMatches);

  useEffect(() => {
    if (globalThis.window === undefined) return;
    const media = globalThis.matchMedia(TIGHT_SCREEN_QUERY);
    const update = () => setIsTightScreen(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isTightScreen;
}
