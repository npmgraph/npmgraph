import { isValidJson, loadPackageJson, readFile } from '../lib/read_file.js';
import useEventListener from '../lib/useEventListener.js';
import * as styles from './useExternalInput.module.scss';

let dragEnterCounter = 0;

function updateDragOverlay() {
  document.documentElement.classList.toggle(styles.root, dragEnterCounter > 0);
}

function onDrop(ev: DragEvent) {
  dragEnterCounter = 0;
  updateDragOverlay();

  ev.preventDefault();

  // If dropped items aren't files, reject them
  const dt = ev.dataTransfer;
  if (!dt?.items)
    return alert('Sorry, file dropping is not supported by this browser');
  if (dt.items.length !== 1) return alert('You must drop exactly one file');

  const item = dt.items[0];
  if (item.type && item.type !== 'application/json')
    return alert('File must have a ".json" extension');

  const file = item.getAsFile();
  if (!file) {
    return alert(
      'Please drop a file, not... well... whatever else it was you dropped',
    );
  }

  readFile(file);
}

async function onPaste(ev: ClipboardEvent) {
  const firstItem = ev.clipboardData?.items[0];
  if (firstItem?.kind === 'file') {
    readFile(firstItem.getAsFile()!);
    ev.preventDefault();
    return;
  }

  const text = ev.clipboardData?.getData('text');
  if (!text) return;

  // Ignore pastes in fields, unless the field is the search field and the paste is a JSON file
  if (
    ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '') &&
    (document.activeElement?.id !== 'search-field' || !isValidJson(text))
  ) {
    return;
  }

  // Let invalid JSON text through when outside the field, so the user can see the error message
  ev.preventDefault();
  loadPackageJson(text);
}

export default function useExternalInput() {
  useEventListener(globalThis, 'paste', onPaste);
  useEventListener(document.documentElement, 'drop', onDrop);

  useEventListener(globalThis, 'dragover', event => {
    // Must inform the browser that we'll handle the `drop` event
    // https://stackoverflow.com/a/21341021
    event.preventDefault();
  });

  // Show overlay. `dragenter` is fired repeatedly for any random element that we glide over,
  // not just on `globalThis`, so we need to keep track of how many nested elements we're inside
  useEventListener(globalThis, 'dragenter', () => {
    dragEnterCounter++;
    updateDragOverlay();
  });
  useEventListener(globalThis, 'dragleave', () => {
    dragEnterCounter--;
    updateDragOverlay();
  });
  useEventListener(globalThis, 'click', () => {
    // Fail safe in case the browser skips some `dragleave` events
    dragEnterCounter = 0;
    updateDragOverlay();
  });
}
