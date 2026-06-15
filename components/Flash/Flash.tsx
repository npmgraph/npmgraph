import { useEffect, useState } from 'react';
import * as appHeaderStyles from '../AppHeader.module.scss';
import * as graphDiagramStyles from '../GraphDiagram/GraphDiagram.module.scss';
import * as flashStyles from './Flash.module.scss';
import {
  notifyFlashElementReady,
  subscribeFlash,
  type FlashEntry,
} from './flash.ts';

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
          className={`${flashStyles.flash} ${entry.isError ? flashStyles.error : ''}`}
          style={{
            maxWidth: `${layout.maxWidth}px`,
            backgroundColor: entry.backgroundColor,
          }}
          ref={element => {
            if (element) {
              notifyFlashElementReady(entry.id, element);
            }
          }}
          onAnimationEnd={event => {
            if (event.animationName !== flashStyles.flashOut) return;
            const { target } = event.nativeEvent;
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

  const appHeader = document.querySelector(`.${appHeaderStyles.root}`);

  const top =
    FLASH_GAP / 2 +
    (appHeader instanceof HTMLElement
      ? appHeader.offsetTop + appHeader.offsetHeight
      : 0);

  return { top, maxWidth };
}
