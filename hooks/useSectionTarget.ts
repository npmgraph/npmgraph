import { useEffect, useRef } from 'react';
import { PARAM_SECTION } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';

export function sectionName(title: string) {
  return title.toLowerCase();
}

const MIN_VISIBLE = 100;

function getScrollParent(element: HTMLElement) {
  for (
    let parent = element.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    if (/auto|scroll/.test(getComputedStyle(parent).overflowY)) {
      return parent;
    }
  }

  return undefined;
}

// Scroll just enough to show MIN_VISIBLE px of the element; don't touch the scroll if that much is already visible
function revealElement(element: HTMLElement) {
  const parent = getScrollParent(element);
  const bounds = parent?.getBoundingClientRect() ?? {
    top: 0,
    bottom: globalThis.innerHeight,
  };
  const rect = element.getBoundingClientRect();
  const min = Math.min(MIN_VISIBLE, rect.height);
  const above = bounds.top + min - rect.bottom;
  const below = rect.top + min - bounds.bottom;
  const delta = above > 0 ? -above : Math.max(below, 0);
  if (delta) {
    (parent ?? globalThis).scrollBy?.({ top: delta });
  }
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

    revealElement(ref.current);
  }, [section, name]);

  return ref;
}
