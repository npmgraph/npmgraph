import { flash } from './flash.ts';

export function handleGlobalError(event: ErrorEvent) {
  console.error(event);
  flash(event.message);
}
