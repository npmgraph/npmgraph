import { useEffect, useState } from 'react';

const TIGHT_SCREEN_QUERY = '(max-aspect-ratio: 2/3), (max-width: 700px)';

function getMatches() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(TIGHT_SCREEN_QUERY).matches;
}

export function useTightScreen() {
  const [isTightScreen, setIsTightScreen] = useState(getMatches);

  useEffect(() => {
    const media = window.matchMedia(TIGHT_SCREEN_QUERY);
    const update = () => setIsTightScreen(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isTightScreen;
}
