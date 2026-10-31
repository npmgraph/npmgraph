import { closestElementOptional } from 'select-dom';

const BLOCKER_SIZE = 8;
const BLOCKER_MAX_MS = 5000;

/**
Browsers show the URL of the hovered link in a status bubble that covers our own
activity bar. After a link click, an invisible blocker is placed under the cursor
so the link isn't hovered anymore. It disappears when the cursor moves.

Returns a function to stop it.
*/
export function hideLinkStatusAfterClick() {
  const controller = new AbortController();
  const { signal } = controller;
  let removeBlocker: (() => void) | undefined;

  document.addEventListener(
    'click',
    event => {
      const { clientX, clientY, button, detail, target } = event;
      const hasModifier =
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
      // `detail` is 0 for keyboard activation, which doesn't hover anything
      if (button !== 0 || detail === 0 || hasModifier) {
        return;
      }

      const link = closestElementOptional('a[href]', target as Node);
      if (!link) {
        return;
      }

      removeBlocker?.();

      const blocker = document.createElement('div');
      blocker.dataset['linkStatusBlocker'] = '';
      blocker.ariaHidden = 'true';
      Object.assign(blocker.style, {
        position: 'fixed',
        zIndex: '2147483647',
        left: `${clientX - BLOCKER_SIZE / 2}px`,
        top: `${clientY - BLOCKER_SIZE / 2}px`,
        width: `${BLOCKER_SIZE}px`,
        height: `${BLOCKER_SIZE}px`,
        cursor: getComputedStyle(link).cursor,
        overflow: 'hidden',
      });
      const spacer = document.createElement('div');
      spacer.style.height = `${BLOCKER_SIZE * 2}px`;
      blocker.append(spacer);
      document.body.append(blocker);
      // WebKit only re-checks what's under a still cursor after something
      // scrolls, otherwise it keeps showing the link status
      blocker.scrollTop = 1;

      const cleanup = new AbortController();
      const timeout = setTimeout(() => removeBlocker?.(), BLOCKER_MAX_MS);
      removeBlocker = () => {
        clearTimeout(timeout);
        blocker.remove();
        cleanup.abort();
        removeBlocker = undefined;
      };

      document.addEventListener(
        'pointermove',
        moveEvent => {
          const distance = Math.hypot(
            moveEvent.clientX - clientX,
            moveEvent.clientY - clientY,
          );
          if (distance > BLOCKER_SIZE / 2) {
            removeBlocker?.();
          }
        },
        { signal: cleanup.signal },
      );
      document.addEventListener('pointerdown', () => removeBlocker?.(), {
        signal: cleanup.signal,
      });
    },
    { signal },
  );

  return () => {
    controller.abort();
    removeBlocker?.();
  };
}
