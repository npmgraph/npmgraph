import { useEffect, useRef } from 'react';
import { PARAM_SECTION } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';

export function sectionName(title: string) {
  return title.toLowerCase();
}

// Open and scroll to the section named in the URL hash, if it's this one
export default function useSectionTarget<T extends HTMLElement>(name: string) {
  const [section] = useHashParam(PARAM_SECTION);
  const ref = useRef<T>(null);
  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler -- Must act on the DOM node after mount
    if (section !== name || !ref.current) {
      return;
    }

    if (ref.current instanceof HTMLDetailsElement) {
      ref.current.open = true;
    }

    ref.current.scrollIntoView?.({ block: 'start' });
  }, [section, name]);

  return ref;
}
