import { useEffect, useState } from 'react';
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

type FlashLayout = {
  top: number;
  maxWidth: number;
};

export default function Flash() {
  const [entries, setEntries] = useState<FlashViewEntry[]>([]);
  const [layout, setLayout] = useState<FlashLayout>(() => computeLayout());

  useEffect(
    () =>
      subscribeFlash(entry => {
        setEntries(previous => [...previous, entry]);
        setLayout(computeLayout());
      }),
    [],
  );

  useEffect(() => {
    const handleResize = () => {
      setLayout(computeLayout());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={flashStyles.root} style={{ top: `${layout.top}px` }}>
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
            maxWidth: `${layout.maxWidth}px`,
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

function computeLayout(): FlashLayout {
  const graph = document.querySelector(`.${graphDiagramStyles.graph}`);

  const graphWidth = graph instanceof HTMLElement ? graph.offsetWidth : 0;
  const maxWidth = Math.max(
    160,
    graphWidth > 0 ? graphWidth - FLASH_GAP : window.innerWidth - FLASH_GAP * 2,
  );

  // On tight screens the header is followed by the mobile tabs, both inside
  // the sticky top container, so place the flash below the whole container
  const topBar = document.querySelector(`.${appStyles.stickyTop}`);

  const top =
    FLASH_GAP / 2 +
    (topBar instanceof HTMLElement ? topBar.getBoundingClientRect().bottom : 0);

  return { top, maxWidth };
}
