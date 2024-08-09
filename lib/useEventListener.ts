import { useEffect } from 'react';

export default function useEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | typeof globalThis,
  eventName: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
  dependencies: unknown[] = [],
): void {
  useEffect(() => {
    element.addEventListener(eventName, handler as EventListener);

    return () => {
      element.removeEventListener(eventName, handler as EventListener);
    };
  }, [eventName, handler, element, ...dependencies]);
}
