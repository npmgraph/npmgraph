export function eventIsModified(e) {
  return e.which > 1 ||
    e.shiftKey ||
    e.altKey ||
    e.metaKey ||
    e.ctrlKey;
}

/**
 * Allow shift-click, ctrl-click, etc. in browsers to work as intended when they
 * might otherwise be swallowed by event handlers
 */
export function handleModifiedClicks() {
  document.addEventListener('click', e => {
    // Ignore events that aren't modified link clicks
    if (!e.target.closest('A') || !eventIsModified(e)) return;

    // Stop processing this event
    e.preventDefault();
    e.stopPropagation();

    // Perform the click on a new link (sans-event handlers)
    const el = document.createElement('a');
    el.href = e.target.href;
    el.dispatchEvent(new MouseEvent('click', e));
  }, true);
}
