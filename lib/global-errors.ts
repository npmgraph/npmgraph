import { flashError } from './flash.ts';

export function handleGlobalError(event: ErrorEvent) {
  console.error(event);

  // Browsers hide the details of cross-origin script errors (e.g. from extensions), so there's nothing to show
  if (event.message === 'Script error.' && !event.filename) {
    return;
  }

  flashError(event.message);
}
