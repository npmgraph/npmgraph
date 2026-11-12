import { flashError } from './flash.ts';

export function handleGlobalError(event: ErrorEvent | PromiseRejectionEvent) {
  if (event instanceof PromiseRejectionEvent) {
    flashError(event.reason);
    return;
  }

  // Browsers hide the details of cross-origin script errors, so there's nothing to show.
  // Safari on iOS throws one from `SharingLinkExtractorJS.viewportDominantIFrameHandle()`:
  // it's undocumented and looks for any iframe on the page, which we don't have.
  if (!event.filename) {
    return;
  }

  flashError(event.message);
}
