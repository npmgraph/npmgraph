import QueryInput from './InfoPane/QueryInput.tsx';
import Logo from './Logo.tsx';
import * as styles from './AppHeader.module.scss';
import { useGlobalState } from '../lib/GlobalStore.ts';
import useHashParam from '../lib/useHashParam.ts';
import type { HTMLProps } from 'react';
import { PANE, PARAM_HIDE } from '../lib/constants.ts';

import { Splitter } from './Splitter.tsx';
import { Tab } from './Tab.tsx';

export default function AppHeader({
  className = '',
}: HTMLProps<HTMLAnchorElement>) {
  const [pane, setPane] = useGlobalState('pane');
  const [hide, setHide] = useHashParam(PARAM_HIDE);

  const inspector = hide === null;
  return (
    <div className={[styles.root, className].join(' ')}>
      <Logo />
      <QueryInput className={styles.input} />

      <div id="tabs">
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
        <Splitter isOpen={inspector} onClick={() => setHide(true)} />
      </div>
    </div>
  );
}
