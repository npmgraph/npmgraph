import { useEffect, useRef } from 'react';
import { PARAM_SECTION } from '../lib/constants.ts';
import { hashGet } from '../lib/url-util.ts';
import useHashParameter from './useHashParameter.ts';

// The only section that gets scrolled to by itself is the one in the URL on page load
const pageLoadSection = hashGet(PARAM_SECTION);
let hasScrolledToPageLoadSection = false;

export function sectionName(title: string) {
  return title.toLowerCase();
}

// Open the section named in the URL hash, if it's this one. Scroll to it only
// on page load: later URL changes must not move the page under the user.
export default function useSectionTarget<T extends HTMLElement>(name: string) {
  const [section] = useHashParameter(PARAM_SECTION);
  const ref = useRef<T>(null);
  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler -- Must act on the DOM node after mount
    if (section !== name || !ref.current) {
      return;
    }

    if (ref.current instanceof HTMLDetailsElement) {
      ref.current.open = true;
    }

    // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler -- Scrolls only once, for the section from the page load
    if (name !== pageLoadSection || hasScrolledToPageLoadSection) {
      return;
    }

    hasScrolledToPageLoadSection = true;
    ref.current.scrollIntoView?.({ block: 'nearest' });
  }, [section, name]);

  return ref;
}
