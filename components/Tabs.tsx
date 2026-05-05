import * as styles from './Tabs.module.scss';

import { PANE, PARAM_HIDE } from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import useHashParam from '../lib/useHashParam.ts';

import { Splitter } from './Splitter.tsx';
import { Tab } from './Tab.tsx';
import type { HTMLProps } from 'react';

export default function Tabs({ className }: HTMLProps<HTMLInputElement>) {
  const [pane, setPane] = useGlobalState('pane');
  const [hide, setHide] = useHashParam(PARAM_HIDE);

  const inspector = hide === null;
  return (
    <div className={[styles.root, className].join(' ')}>
      <Tab
        active={inspector && pane === PANE.INFO}
        onClick={() => {
          setHide(null);
          setPane(PANE.INFO);
        }}
      >
        Info
      </Tab>
      <Tab
        active={inspector && pane === PANE.GRAPH}
        onClick={() => {
          setHide(null);
          setPane(PANE.GRAPH);
        }}
      >
        Graph
      </Tab>
      <Tab
        active={inspector && pane === PANE.MODULE}
        onClick={() => {
          setHide(null);
          setPane(PANE.MODULE);
        }}
      >
        Module
      </Tab>
      <Tab
        active={inspector && pane === PANE.SETTINGS}
        onClick={() => {
          setHide(null);
          setPane(PANE.SETTINGS);
        }}
      >
        Settings
      </Tab>
      <Splitter isOpen={inspector} onClick={() => setHide(true)} />
    </div>
  );
}
