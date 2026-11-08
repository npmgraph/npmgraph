import { PARAM_SECTION } from './constants.ts';

function getSection() {
  return new URLSearchParams(location.hash.slice(1)).get(PARAM_SECTION);
}

// Only the initial URL and navigation (permalink click, back/forward) request a
// scroll. Remounting a section later (e.g. after a new query) must not.
let pendingSection = getSection();

globalThis.addEventListener('hashchange', () => {
  pendingSection = getSection();
});

export function consumeSectionScroll(name: string) {
  if (pendingSection !== name) {
    return false;
  }

  pendingSection = null;
  return true;
}
