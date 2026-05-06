import type { HTMLProps } from 'react';
import * as indexStyles from '../index.module.scss';
import { PaneType, PARAM_HIDE } from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { cn } from '../lib/dom.ts';
import useHashParam from '../lib/useHashParam.ts';

import { Splitter } from './Splitter.tsx';
import * as styles from './Tabs.module.scss';

function Tab({
  active,
  children,
  ...props
}: HTMLProps<HTMLDivElement> & {
  active: boolean;
}) {
  return (
    <div className={cn(styles.tab, { [styles.active]: active })} {...props}>
      <button type="button" className={indexStyles.brightHover}>
        {children}
      </button>
    </div>
  );
}

export default function Tabs({ className }: HTMLProps<HTMLInputElement>) {
  const [pane, setPane] = useGlobalState('pane');
  const [hide, setHide] = useHashParam(PARAM_HIDE);

  const inspector = hide === null;
  return (
    <div className={[styles.root, className].join(' ')}>
      <Tab
        active={inspector && pane === PaneType.INFO}
        onClick={() => {
          setHide(null);
          setPane(PaneType.INFO);
        }}
      >
        Info
      </Tab>
      <Tab
        active={inspector && pane === PaneType.GRAPH}
        onClick={() => {
          setHide(null);
          setPane(PaneType.GRAPH);
        }}
      >
        Graph
      </Tab>
      <Tab
        active={inspector && pane === PaneType.MODULE}
        onClick={() => {
          setHide(null);
          setPane(PaneType.MODULE);
        }}
      >
        Module
      </Tab>
      <Tab
        active={inspector && pane === PaneType.SETTINGS}
        onClick={() => {
          setHide(null);
          setPane(PaneType.SETTINGS);
        }}
      >
        Settings
      </Tab>
      <Splitter isOpen={inspector} onClick={() => setHide(true)} />
    </div>
  );
}
