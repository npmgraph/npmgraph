import { useEffect, useState, useSyncExternalStore } from 'react';
import * as appStyles from '../App/App.module.scss';
import * as graphDiagramStyles from '../GraphDiagram/GraphDiagram.module.scss';
import * as flashStyles from './Flash.module.scss';
import {
  notifyFlashElementReady,
  subscribeFlash,
  type FlashEntry,
} from '../../lib/flash.ts';

const FLASH_GAP = 10;

type FlashViewEntry = FlashEntry;

export default function Flash() {
  const [entries, setEntries] = useState<FlashViewEntry[]>([]);

  // Read from the DOM on resize and on every render (e.g. a new flash)
  const top = useSyncExternalStore(subscribeToResize, getTop);
  const maxWidth = useSyncExternalStore(subscribeToResize, getMaxWidth);

  useEffect(
    () =>
      subscribeFlash(entry => {
        setEntries(previous => [...previous, entry]);
      }),
    [],
  );

  return (
    <div className={flashStyles.root} style={{ top: `${top}px` }}>
      {entries.map(entry => (
        <div
          key={entry.id}
          ref={element => {
            if (element) {
              notifyFlashElementReady(entry.id, element);
            }
          }}
          className={`${flashStyles.flash} ${entry.isError ? flashStyles.error : ''}`}
          style={{
            maxWidth: `${maxWidth}px`,
            backgroundColor: entry.backgroundColor,
          }}
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

function getMaxWidth() {
  const graph = document.querySelector(`.${graphDiagramStyles.graph}`);

  const graphWidth = graph instanceof HTMLElement ? graph.offsetWidth : 0;
  return Math.max(
    160,
    graphWidth > 0 ? graphWidth - FLASH_GAP : window.innerWidth - FLASH_GAP * 2,
  );
}

function getTop() {
  // On tight screens the header is followed by the mobile tabs, both inside
  // the sticky top container, so place the flash below the whole container
  const topBar = document.querySelector(`.${appStyles.stickyTop}`);

  return (
    FLASH_GAP / 2 +
    (topBar instanceof HTMLElement ? topBar.getBoundingClientRect().bottom : 0)
  );
}
