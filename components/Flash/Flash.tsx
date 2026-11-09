import { useEffect, useState, useSyncExternalStore } from 'react';
import { $optional } from 'select-dom';
import * as appStyles from '../App/App.module.scss';
import {
  notifyFlashElementReady,
  subscribeFlash,
  type FlashEntry,
} from '../../lib/flash.ts';
import * as flashStyles from './Flash.module.css';

const FLASH_GAP = 10;

export default function Flash() {
  type FlashViewEntry = FlashEntry;
  const [entries, setEntries] = useState<FlashViewEntry[]>([]);

  // Read from the DOM on resize and on every render (e.g. a new flash)
  const top = useSyncExternalStore(subscribeToResize, getTop);

  useEffect(
    () =>
      subscribeFlash(entry => {
        setEntries(previous => [...previous, entry]);
      }),
    [],
  );

  return (
    <div className={flashStyles.root} style={{ top: `${top}px` }} role="status">
      {entries.map(entry => (
        <div
          key={entry.id}
          ref={element => {
            if (element) {
              notifyFlashElementReady(entry.id, element);
            }
          }}
          className={`${flashStyles.flash} ${entry.isError ? flashStyles.error : ''}`}
          onAnimationEnd={event => {
            if (event.animationName !== flashStyles.flashOut) {
              return;
            }

            setEntries(previous => previous.filter(x => x.id !== entry.id));
          }}
        >
          {entry.message}
        </div>
      ))}
    </div>
  );
}

function subscribeToResize(callback: () => void) {
  window.addEventListener('resize', callback);

  return () => {
    window.removeEventListener('resize', callback);
  };
}

function getTop() {
  // On tight screens the header is followed by the mobile tabs, both inside
  // the sticky top container, so place the flash below the whole container
  const topBar = $optional(`.${appStyles.stickyTop}`);

  return (
    FLASH_GAP / 2 +
    (topBar instanceof HTMLElement ? topBar.getBoundingClientRect().bottom : 0)
  );
}
